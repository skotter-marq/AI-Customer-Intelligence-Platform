'use client';

import React, { useState, useEffect } from 'react';
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
  LineChart,
  PieChart,
  Zap,
  BellRing,
  Trash2,
  Building,
  MapPin,
  Shield,
  Award,
  Briefcase,
  X,
  ArrowLeft,
  ArrowRight,
  Package,
  Layers,
  GitCompare,
  Rocket,
  Bot,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  FileText,
  Link2,
  CheckCircle2,
  AlertCircle
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
  
  // Agent search and filtering state
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  const [agentTypeFilter, setAgentTypeFilter] = useState<'all' | 'pricing' | 'features' | 'news' | 'hiring' | 'social' | 'funding'>('all');
  const [agentStatusFilter, setAgentStatusFilter] = useState<'all' | 'active' | 'paused' | 'error'>('all');
  const [agentGrouping, setAgentGrouping] = useState<'type' | 'status' | 'performance' | 'none'>('none');

  // Competitor search and filtering state
  const [competitorSearchQuery, setCompetitorSearchQuery] = useState('');
  const [competitorThreatFilter, setCompetitorThreatFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [competitorStatusFilter, setCompetitorStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [competitorGrouping, setCompetitorGrouping] = useState<'threat' | 'industry' | 'size' | 'none'>('none');
  const [loading, setLoading] = useState(true);
  const [showDatabaseSetupNotice, setShowDatabaseSetupNotice] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'market-insights' | 'product-intelligence' | 'sales-marketing' | 'alerts'>('overview');
  const [expandedReports, setExpandedReports] = useState<string[]>([]);
  const [reportStatuses, setReportStatuses] = useState<Record<string, 'new' | 'in-review' | 'action-taken' | 'resolved'>>({});
  const [reviewedReports, setReviewedReports] = useState<string[]>([]);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [reportFilters, setReportFilters] = useState({
    competitor: 'all',
    priority: 'all',
    status: 'all',
    category: 'all',
    timeRange: 'all'
  });

  const toggleReportExpansion = (reportId: string) => {
    setExpandedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const updateReportStatus = (reportId: string, status: 'new' | 'in-review' | 'action-taken' | 'resolved') => {
    setReportStatuses(prev => ({
      ...prev,
      [reportId]: status
    }));
  };

  const toggleReportReviewed = (reportId: string) => {
    setReviewedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const toggleReportSelected = (reportId: string) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const toggleSelectAll = () => {
    const allReportIds = [
      'report-1', 'report-2', 'report-3', 'report-4'
    ];
    if (selectedReports.length === allReportIds.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(allReportIds);
    }
  };

  const bulkUpdateStatus = (status: 'new' | 'in-review' | 'action-taken' | 'resolved') => {
    const updates: Record<string, 'new' | 'in-review' | 'action-taken' | 'resolved'> = {};
    selectedReports.forEach(id => {
      updates[id] = status;
    });
    setReportStatuses(prev => ({ ...prev, ...updates }));
    setSelectedReports([]); // Clear selection
  };

  const bulkMarkAsReviewed = () => {
    setReviewedReports(prev => [...new Set([...prev, ...selectedReports])]);
    setSelectedReports([]); // Clear selection
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'action-taken': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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

  useEffect(() => {
    fetchCompetitorData();
  }, []);


  const filteredInsights = insightFilter === 'all' ? insights : insights.filter(i => i.type === insightFilter);
  
  // Competitor filtering logic
  const filteredCompetitors = competitors.filter(competitor => {
    // Search filter
    if (competitorSearchQuery) {
      const query = competitorSearchQuery.toLowerCase();
      if (!competitor.name.toLowerCase().includes(query) && 
          !competitor.industry.toLowerCase().includes(query) &&
          !competitor.description.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    // Threat level filter
    if (competitorThreatFilter !== 'all' && competitor.threat_level !== competitorThreatFilter) {
      return false;
    }
    
    // Status filter (based on monitoring status)
    if (competitorStatusFilter !== 'all') {
      const isActive = competitor.status === 'active'; // Assuming status field exists
      if (competitorStatusFilter === 'active' && !isActive) return false;
      if (competitorStatusFilter === 'inactive' && isActive) return false;
    }
    
    return true;
  });

  // Competitor grouping logic
  const groupedCompetitors = React.useMemo(() => {
    if (competitorGrouping === 'none') {
      return [{ title: '', competitors: filteredCompetitors }];
    }
    
    const groups: { title: string; competitors: CompetitorProfile[] }[] = [];
    
    if (competitorGrouping === 'threat') {
      const threats = Array.from(new Set(filteredCompetitors.map(c => c.threat_level)));
      threats.forEach(threat => {
        const threatCompetitors = filteredCompetitors.filter(c => c.threat_level === threat);
        groups.push({
          title: threat.charAt(0).toUpperCase() + threat.slice(1) + ' Threat',
          competitors: threatCompetitors
        });
      });
    } else if (competitorGrouping === 'industry') {
      const industries = Array.from(new Set(filteredCompetitors.map(c => c.industry)));
      industries.forEach(industry => {
        const industryCompetitors = filteredCompetitors.filter(c => c.industry === industry);
        groups.push({
          title: industry,
          competitors: industryCompetitors
        });
      });
    } else if (competitorGrouping === 'size') {
      // Group by company size based on employee count
      const large = filteredCompetitors.filter(c => c.financial_metrics?.employees && c.financial_metrics.employees > 1000);
      const medium = filteredCompetitors.filter(c => c.financial_metrics?.employees && c.financial_metrics.employees > 100 && c.financial_metrics.employees <= 1000);
      const small = filteredCompetitors.filter(c => !c.financial_metrics?.employees || c.financial_metrics.employees <= 100);
      
      if (large.length > 0) groups.push({ title: 'Large Companies (1000+ employees)', competitors: large });
      if (medium.length > 0) groups.push({ title: 'Medium Companies (100-1000 employees)', competitors: medium });
      if (small.length > 0) groups.push({ title: 'Small Companies (<100 employees)', competitors: small });
    }
    
    return groups;
  }, [filteredCompetitors, competitorGrouping]);
  
  // Agent filtering logic
  const filteredAgents = agents.filter(agent => {
    // Search filter
    if (agentSearchQuery) {
      const query = agentSearchQuery.toLowerCase();
      if (!agent.name.toLowerCase().includes(query) && 
          !agent.type.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    // Type filter
    if (agentTypeFilter !== 'all' && agent.type !== agentTypeFilter) {
      return false;
    }
    
    // Status filter
    if (agentStatusFilter !== 'all' && agent.status !== agentStatusFilter) {
      return false;
    }
    
    return true;
  });

  // Agent grouping logic
  const groupedAgents = React.useMemo(() => {
    if (agentGrouping === 'none') {
      return [{ title: '', agents: filteredAgents }];
    }
    
    const groups: { title: string; agents: IntelligenceAgent[] }[] = [];
    
    if (agentGrouping === 'type') {
      const types = Array.from(new Set(filteredAgents.map(a => a.type)));
      types.forEach(type => {
        const typeAgents = filteredAgents.filter(a => a.type === type);
        groups.push({
          title: type.charAt(0).toUpperCase() + type.slice(1) + ' Agents',
          agents: typeAgents
        });
      });
    } else if (agentGrouping === 'status') {
      const statuses = Array.from(new Set(filteredAgents.map(a => a.status)));
      statuses.forEach(status => {
        const statusAgents = filteredAgents.filter(a => a.status === status);
        groups.push({
          title: status.charAt(0).toUpperCase() + status.slice(1) + ' Agents',
          agents: statusAgents
        });
      });
    } else if (agentGrouping === 'performance') {
      const highPerf = filteredAgents.filter(a => a.success_rate >= 95);
      const mediumPerf = filteredAgents.filter(a => a.success_rate >= 85 && a.success_rate < 95);
      const lowPerf = filteredAgents.filter(a => a.success_rate < 85);
      
      if (highPerf.length > 0) groups.push({ title: 'High Performance (95%+)', agents: highPerf });
      if (mediumPerf.length > 0) groups.push({ title: 'Medium Performance (85-94%)', agents: mediumPerf });
      if (lowPerf.length > 0) groups.push({ title: 'Low Performance (<85%)', agents: lowPerf });
    }
    
    return groups;
  }, [filteredAgents, agentGrouping]);

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Competitor Intelligence</h1>
                <p className="text-gray-600">Monitor competitive landscape and market insights</p>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm">
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'overview'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>Overview</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('market-insights')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'market-insights'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <LineChart className="w-4 h-4" />
                    <span>Market Insights</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('product-intelligence')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'product-intelligence'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span>Product Intelligence</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('sales-marketing')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'sales-marketing'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Sales & Marketing</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'alerts'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <BellRing className="w-4 h-4" />
                    <span>Alerts Center</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <>
              {/* Dashboard Swimlanes */}
          {/* High Priority Competitors Swimlane */}
          <div className="mb-8">
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <Building className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Competitors</h2>
                    <div className="flex items-center space-x-6 mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">{competitors.filter(c => c.threat_level === 'high').length} High Threat</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">{competitors.filter(c => c.threat_level === 'medium').length} Medium</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">{competitors.filter(c => c.status === 'active').length} Monitoring</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Key Metrics - Compact Visual Cards */}
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200 w-32 h-16">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div className="w-16 text-center">
                      <div className="text-lg font-bold text-red-700">{competitors.filter(c => c.threat_level === 'high').length}</div>
                      <div className="text-xs text-red-600">Threats</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 w-32 h-16">
                    <Activity className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="w-16 text-center">
                      <div className="text-lg font-bold text-green-700">{competitors.filter(c => c.status === 'active').length}</div>
                      <div className="text-xs text-green-600">Active</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 w-32 h-16">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="w-16 text-center">
                      <div className="text-lg font-bold text-blue-700">{insights.filter(i => i.source?.includes('competitor')).length}</div>
                      <div className="text-xs text-blue-600">Updates</div>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-gray-300"></div>
                  
                  <button 
                    onClick={() => router.push('/competitor-intelligence/add-competitor')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Competitor</span>
                  </button>
                  <button 
                    onClick={() => router.push('/competitor-intelligence/competitors')}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span>View All ({competitors.length})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* High Priority Competitor Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {competitors
                  .filter(c => c.threat_level === 'high' || c.threat_level === 'medium')
                  .slice(0, 6)
                  .map((competitor) => {
                    const getThreatColor = (level: string) => {
                      switch (level) {
                        case 'high': return 'bg-red-100 text-red-800 border-red-200';
                        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                        case 'low': return 'bg-green-100 text-green-800 border-green-200';
                        default: return 'bg-gray-100 text-gray-800 border-gray-200';
                      }
                    };

                    return (
                      <div key={competitor.id} className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all duration-200 h-[220px] flex flex-col">
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden">
                              {competitor.logo && competitor.logo.startsWith('http') ? (
                                <img 
                                  src={competitor.logo} 
                                  alt={`${competitor.name} logo`}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.parentElement!.innerHTML = `<span class="text-lg font-semibold text-gray-600">${competitor.name.charAt(0)}</span>`;
                                  }}
                                />
                              ) : (
                                <span className="text-lg font-semibold text-gray-600">
                                  {competitor.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm truncate">{competitor.name}</h3>
                              <p className="text-xs text-gray-500 truncate">{competitor.industry}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getThreatColor(competitor.threat_level)}`}>
                              {competitor.threat_level.toUpperCase()}
                            </span>
                          </div>
                          
                          {/* Recent Activity */}
                          <div className="mb-3 p-3 bg-amber-50/50 rounded-lg border-l-2 border-amber-200">
                            <p className="text-xs font-medium text-amber-700 mb-1">Recent Activity</p>
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {competitor.recent_news && competitor.recent_news.length > 0 
                                ? competitor.recent_news[0].title
                                : competitor.valuation 
                                  ? `Valued at ${competitor.valuation} • ${competitor.growth_rate}% growth`
                                  : 'No recent activity detected • Monitoring for updates'
                              }
                            </p>
                          </div>

                          {/* Spacer to push actions to bottom */}
                          <div className="flex-1"></div>

                          {/* Quick Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {/* Website Link */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(competitor.website?.startsWith('http') ? competitor.website : `https://${competitor.website}`, '_blank');
                                }}
                                className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                                title="Visit website"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Visit</span>
                              </button>
                              
                              {/* Agent Insights */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Navigate to agent insights for this competitor
                                  console.log('View agent insights for', competitor.name);
                                }}
                                className="flex items-center space-x-1 px-2 py-1 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md transition-colors"
                                title="View AI agent insights"
                              >
                                <Zap className="w-3 h-3" />
                                <span>Insights</span>
                              </button>
                            </div>

                            {/* Monitoring Status */}
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${competitor.status === 'active' ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                              <span className="text-xs text-gray-600">
                                {competitor.status === 'active' ? 'Monitoring' : 'Paused'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* AI Agents Swimlane */}
          <div className="mb-8">
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">AI Agents</h2>
                    <div className="flex items-center space-x-6 mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">{agents.filter(a => a.status === 'active').length} Active</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">{agents.reduce((sum, agent) => sum + agent.total_insights, 0)} Insights</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">{agents.reduce((sum, agent) => sum + (agent.competitor_ids?.length || 0), 0)} Monitoring</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Key Metrics - Compact Visual Cards */}
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 w-32 h-16">
                    <Zap className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="w-16 text-center">
                      <div className="text-lg font-bold text-green-700">{agents.filter(a => a.status === 'active').length}</div>
                      <div className="text-xs text-green-600">Active</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 w-32 h-16">
                    <Star className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <div className="w-16 text-center">
                      <div className="text-lg font-bold text-purple-700">{agents.reduce((sum, agent) => sum + agent.total_insights, 0)}</div>
                      <div className="text-xs text-purple-600">Insights</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 w-32 h-16">
                    <Eye className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="w-16 text-center">
                      <div className="text-lg font-bold text-blue-700">{agents.reduce((sum, agent) => sum + (agent.competitor_ids?.length || 0), 0)}</div>
                      <div className="text-xs text-blue-600">Tracking</div>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-gray-300"></div>
                  
                  <button 
                    onClick={() => router.push('/competitor-intelligence/create-agent')}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Agent</span>
                  </button>
                  <button 
                    onClick={() => router.push('/competitor-intelligence/agents')}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span>Manage All ({agents.length})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Active Agent Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {agents
                  .filter(agent => agent.status === 'active')
                  .slice(0, 4)
                  .map((agent) => (
                    <div key={agent.id} className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all duration-200 h-[180px] flex flex-col">
                      <div className="p-4 flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-100 flex-shrink-0">
                            <Zap className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{agent.name}</h3>
                            <p className="text-xs text-gray-500 truncate">{agent.description}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                            agent.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                            agent.status === 'paused' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {agent.status.toUpperCase()}
                          </span>
                        </div>
                        
                        {/* Agent Metrics */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-sm font-bold text-indigo-600">{agent.total_insights}</p>
                            <p className="text-xs text-gray-600">Insights</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-sm font-bold text-green-600">{agent.competitor_ids?.length || 0}</p>
                            <p className="text-xs text-gray-600">Monitoring</p>
                          </div>
                        </div>
                        
                        {/* Agent Actions */}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => router.push(`/competitor-intelligence/create-agent?edit=${agent.id}`)}
                              className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                // TODO: View insights for this agent
                                console.log('View insights for', agent.name);
                              }}
                              className="flex items-center space-x-1 px-2 py-1 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                            <span className="text-xs text-gray-600">Live</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
            </>
          )}

          {/* Market Insights Tab */}
          {activeTab === 'market-insights' && (
            <div className="space-y-6">
              {/* Intelligence Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Agent Reports</h3>
                      <p className="text-2xl font-bold text-blue-600">23</p>
                      <p className="text-xs text-gray-500">last 24 hours</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">High Priority</h3>
                      <p className="text-2xl font-bold text-red-600">5</p>
                      <p className="text-xs text-gray-500">urgent findings</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Sources Monitored</h3>
                      <p className="text-2xl font-bold text-green-600">147</p>
                      <p className="text-xs text-gray-500">websites & feeds</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Actions Taken</h3>
                      <p className="text-2xl font-bold text-purple-600">12</p>
                      <p className="text-xs text-gray-500">auto-responses</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Agent Findings */}
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Bot className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Latest Intelligence Reports</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-sm text-gray-500">Live monitoring</span>
                  </div>
                </div>
                
                {/* Bulk Actions Bar */}
                {selectedReports.length > 0 && (
                  <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-indigo-900">
                          {selectedReports.length} report{selectedReports.length > 1 ? 's' : ''} selected
                        </span>
                        <button
                          onClick={() => setSelectedReports([])}
                          className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                        >
                          Clear Selection
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={bulkMarkAsReviewed}
                          className="text-xs px-3 py-1 bg-green-100 border border-green-300 rounded hover:bg-green-200 transition-colors text-green-700 font-medium"
                        >
                          Mark as Reviewed
                        </button>
                        <select
                          onChange={(e) => bulkUpdateStatus(e.target.value as any)}
                          value=""
                          className="text-xs px-3 py-1 border border-indigo-300 bg-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                        >
                          <option value="">Update Status</option>
                          <option value="new">New</option>
                          <option value="in-review">In Review</option>
                          <option value="action-taken">Action Taken</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Report Filters */}
                <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-gray-200/50">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedReports.length === 4}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">Select All</span>
                  </div>
                  <div className="w-px h-6 bg-gray-200"></div>
                  <select
                    value={reportFilters.competitor}
                    onChange={(e) => setReportFilters({...reportFilters, competitor: e.target.value})}
                    className="text-sm px-3 py-2 border border-gray-200 bg-white/90 backdrop-blur-md rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <option value="all">All Competitors</option>
                    <option value="HubSpot">HubSpot</option>
                    <option value="Salesforce">Salesforce</option>
                    <option value="Pipedrive">Pipedrive</option>
                    <option value="Zendesk">Zendesk</option>
                  </select>
                  
                  <select
                    value={reportFilters.priority}
                    onChange={(e) => setReportFilters({...reportFilters, priority: e.target.value})}
                    className="text-sm px-3 py-2 border border-gray-200 bg-white/90 backdrop-blur-md rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                  
                  <select
                    value={reportFilters.status}
                    onChange={(e) => setReportFilters({...reportFilters, status: e.target.value})}
                    className="text-sm px-3 py-2 border border-gray-200 bg-white/90 backdrop-blur-md rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="in-review">In Review</option>
                    <option value="action-taken">Action Taken</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  
                  <select
                    value={reportFilters.category}
                    onChange={(e) => setReportFilters({...reportFilters, category: e.target.value})}
                    className="text-sm px-3 py-2 border border-gray-200 bg-white/90 backdrop-blur-md rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <option value="all">All Categories</option>
                    <option value="Product Launch">Product Launch</option>
                    <option value="Pricing">Pricing</option>
                    <option value="Technology">Technology</option>
                    <option value="Marketing">Marketing</option>
                  </select>

                  <select
                    value={reportFilters.timeRange}
                    onChange={(e) => setReportFilters({...reportFilters, timeRange: e.target.value})}
                    className="text-sm px-3 py-2 border border-gray-200 bg-white/90 backdrop-blur-md rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>

                  <button
                    onClick={() => setReportFilters({competitor: 'all', priority: 'all', status: 'all', category: 'all', timeRange: 'all'})}
                    className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 transition-all duration-200 text-gray-700 font-medium shadow-sm hover:shadow-md"
                  >
                    Clear Filters
                  </button>
                </div>
                
                <div className="space-y-4">
                  {[
                    {
                      id: 'report-1',
                      priority: 'high',
                      title: 'HubSpot Major Product Launch',
                      category: 'Product Launch',
                      icon: AlertTriangle,
                      color: 'red',
                      competitor: 'HubSpot',
                      time: '2 hours ago',
                      summary: 'HubSpot announced "Service Hub AI" - advanced automation and predictive analytics for customer service teams. Directly competes with our core features.',
                      sources: ['HubSpot Blog', 'Product Hunt', 'TechCrunch', 'LinkedIn'],
                      impact: 'High threat - overlaps 70% of our feature set',
                      confidence: 95,
                      details: {
                        keyFeatures: [
                          'AI-powered ticket routing and prioritization',
                          'Predictive customer satisfaction scoring',
                          'Automated response suggestions',
                          'Advanced analytics dashboard'
                        ],
                        pricing: '$120/month per user (Enterprise tier)',
                        targetMarket: 'Mid-market to enterprise customer service teams',
                        launchDate: 'March 15, 2024',
                        competitiveAdvantage: 'Deep integration with existing HubSpot CRM ecosystem'
                      },
                      recommendedActions: [
                        'Review pricing strategy for competitive response',
                        'Accelerate roadmap for advanced AI features',
                        'Prepare competitive battlecards for sales team',
                        'Analyze feature gaps and prioritize development',
                        'Consider strategic partnerships to match ecosystem depth'
                      ]
                    },
                    {
                      id: 'report-2',
                      priority: 'medium',
                      title: 'Salesforce Pricing Changes',
                      category: 'Pricing',
                      icon: TrendingUp,
                      color: 'yellow',
                      competitor: 'Salesforce',
                      time: '4 hours ago',
                      summary: 'Salesforce increased pricing for Enterprise plans by 12% effective March 1st. Mid-market customers expressing dissatisfaction on Reddit and LinkedIn.',
                      sources: ['Reddit r/salesforce', 'LinkedIn discussions', 'Salesforce.com', 'G2 Reviews'],
                      impact: 'Market opportunity - customer acquisition potential',
                      confidence: 88,
                      details: {
                        priceChanges: [
                          'Enterprise: $150 → $168/user/month',
                          'Professional: $80 → $89/user/month',
                          'Unlimited: $300 → $336/user/month'
                        ],
                        customerSentiment: 'Negative - 67% of comments express frustration',
                        affectedMarket: '~15,000 mid-market customers',
                        competitorResponse: 'HubSpot and Pipedrive holding current pricing'
                      },
                      recommendedActions: [
                        'Launch "Switch & Save" campaign targeting mid-market segment',
                        'Create Salesforce migration toolkit and guides',
                        'Offer 3-month discount for displaced customers',
                        'Target social media ads to frustrated Salesforce users'
                      ]
                    },
                    {
                      id: 'report-3',
                      priority: 'low',
                      title: 'Pipedrive Integration Expansion',
                      category: 'Technology',
                      icon: Zap,
                      color: 'blue',
                      competitor: 'Pipedrive',
                      time: '6 hours ago',
                      summary: 'Pipedrive launched marketplace with 200+ integrations, including deep Zapier and Microsoft Teams connections. Strong developer adoption signals.',
                      sources: ['Pipedrive Blog', 'Developer Forums', 'App Store Analytics'],
                      impact: 'Strategic insight - ecosystem building trend',
                      confidence: 79,
                      details: {
                        integrations: ['Zapier (1000+ workflows)', 'Microsoft Teams', 'Slack', 'QuickBooks', 'Mailchimp'],
                        developerMetrics: '150+ third-party developers, 45% monthly growth',
                        userAdoption: 'Average 3.2 integrations per customer'
                      },
                      recommendedActions: [
                        'Audit our integration ecosystem gaps',
                        'Partner with key integration platforms',
                        'Launch developer program and API improvements'
                      ]
                    },
                    {
                      id: 'report-4',
                      priority: 'medium',
                      title: 'Zendesk Content Strategy Shift',
                      category: 'Marketing',
                      icon: MessageSquare,
                      color: 'green',
                      competitor: 'Zendesk',
                      time: '8 hours ago',
                      summary: 'Zendesk tripled content production focused on "AI customer service" keywords. 15 new whitepapers, webinar series, and influencer partnerships launched.',
                      sources: ['Zendesk.com', 'SEMrush Analytics', 'Content Analysis', 'Social Media'],
                      impact: 'SEO and thought leadership competition increase',
                      confidence: 84,
                      details: {
                        contentVolume: '3x increase in blog posts, 15 whitepapers, 8 webinars',
                        keywordStrategy: 'AI customer service, automated support, intelligent ticketing',
                        influencerNetwork: '12 customer service thought leaders, 500K+ combined reach',
                        seoImpact: 'Ranking improvements for 45+ target keywords'
                      },
                      recommendedActions: [
                        'Accelerate our content marketing in AI space',
                        'Identify and partner with complementary thought leaders',
                        'Create differentiated content on AI ethics and transparency'
                      ]
                    }
                  ].filter((report) => {
                    const matchesCompetitor = reportFilters.competitor === 'all' || report.competitor === reportFilters.competitor;
                    const matchesPriority = reportFilters.priority === 'all' || report.priority === reportFilters.priority;
                    const matchesCategory = reportFilters.category === 'all' || report.category === reportFilters.category;
                    const currentStatus = reportStatuses[report.id] || 'new';
                    const matchesStatus = reportFilters.status === 'all' || currentStatus === reportFilters.status;
                    
                    return matchesCompetitor && matchesPriority && matchesCategory && matchesStatus;
                  }).map((report) => {
                    const isExpanded = expandedReports.includes(report.id);
                    const currentStatus = reportStatuses[report.id] || 'new';
                    const Icon = report.icon;
                    
                    return (
                      <div key={report.id} className={`border-l-4 rounded-lg transition-all duration-200 bg-white/90 backdrop-blur-md shadow-lg border border-gray-200/50 ${
                        isExpanded ? 'shadow-xl' : 'hover:shadow-lg'
                      } ${
                        report.color === 'red' ? 'border-l-red-500' :
                        report.color === 'yellow' ? 'border-l-yellow-500' :
                        report.color === 'blue' ? 'border-l-blue-500' :
                        report.color === 'green' ? 'border-l-green-500' :
                        'border-l-gray-500'
                      }`}>
                        <div className="p-4">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3 flex-1">
                              <input
                                type="checkbox"
                                checked={selectedReports.includes(report.id)}
                                onChange={() => toggleReportSelected(report.id)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <Icon className={`w-4 h-4 ${
                                report.color === 'red' ? 'text-red-600' :
                                report.color === 'yellow' ? 'text-yellow-600' :
                                report.color === 'blue' ? 'text-blue-600' :
                                report.color === 'green' ? 'text-green-600' :
                                'text-gray-600'
                              }`} />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className={`font-medium ${
                                    report.color === 'red' ? 'text-red-900' :
                                    report.color === 'yellow' ? 'text-yellow-900' :
                                    report.color === 'blue' ? 'text-blue-900' :
                                    report.color === 'green' ? 'text-green-900' :
                                    'text-gray-900'
                                  }`}>{report.title}</span>
                                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                    report.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {report.priority === 'high' ? 'High Priority' : 
                                     report.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded border ${getReportStatusColor(currentStatus)}`}>
                                    {currentStatus === 'new' ? 'New' :
                                     currentStatus === 'in-review' ? 'In Review' :
                                     currentStatus === 'action-taken' ? 'Action Taken' : 'Resolved'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-4 text-xs text-gray-600">
                                  <span>{report.category}</span>
                                  <span>•</span>
                                  <span>{report.time}</span>
                                  <span>•</span>
                                  <span>{report.confidence}% confidence</span>
                                  {reviewedReports.includes(report.id) && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center space-x-1 text-green-600 font-medium">
                                        <CheckCircle className="w-3 h-3" />
                                        <span>Reviewed</span>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleReportExpansion(report.id)}
                                className="p-1 hover:bg-white rounded transition-colors"
                                title={isExpanded ? 'Collapse' : 'Expand'}
                              >
                                {isExpanded ? 
                                  <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                                  <ChevronDown className="w-4 h-4 text-gray-500" />
                                }
                              </button>
                            </div>
                          </div>

                          {/* Summary */}
                          <p className="text-sm mb-3 text-gray-900">{report.summary}</p>

                          {/* Quick Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <select
                                value={currentStatus}
                                onChange={(e) => updateReportStatus(report.id, e.target.value as any)}
                                className="text-xs px-3 py-1 border border-gray-300 bg-gray-50 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-gray-700 font-medium"
                              >
                                <option value="new">New</option>
                                <option value="in-review">In Review</option>
                                <option value="action-taken">Action Taken</option>
                                <option value="resolved">Resolved</option>
                              </select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => toggleReportReviewed(report.id)}
                                className={`text-xs px-3 py-1 border rounded hover:bg-opacity-80 transition-colors font-medium ${
                                  reviewedReports.includes(report.id)
                                    ? 'bg-green-100 border-green-300 text-green-700'
                                    : 'bg-yellow-100 border-yellow-300 text-yellow-700 hover:bg-yellow-200'
                                }`}
                                title={reviewedReports.includes(report.id) ? 'Mark as unreviewed' : 'Mark as reviewed'}
                              >
                                <CheckCircle className="w-3 h-3" />
                              </button>
                              <button
                                className="text-xs px-3 py-1 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors text-gray-700"
                                title="Share report"
                              >
                                <Share2 className="w-3 h-3" />
                              </button>
                              <button
                                className="text-xs px-3 py-1 bg-indigo-100 border border-indigo-300 rounded hover:bg-indigo-200 transition-colors text-indigo-700 font-medium"
                                title="Create task"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-white/50 space-y-4">
                              {/* Sources */}
                              <div>
                                <h5 className={`text-sm font-medium mb-2 ${
                                  report.color === 'red' ? 'text-red-900' :
                                  report.color === 'yellow' ? 'text-yellow-900' :
                                  report.color === 'blue' ? 'text-blue-900' :
                                  report.color === 'green' ? 'text-green-900' :
                                  'text-gray-900'
                                }`}>Sources</h5>
                                <div className="flex flex-wrap gap-2">
                                  {report.sources.map((source, index) => (
                                    <span key={index} className="px-2 py-1 bg-white rounded text-xs text-gray-700 border">
                                      <Link2 className="w-3 h-3 inline mr-1" />
                                      {source}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Impact Assessment */}
                              <div>
                                <h5 className={`text-sm font-medium mb-2 ${
                                  report.color === 'red' ? 'text-red-900' :
                                  report.color === 'yellow' ? 'text-yellow-900' :
                                  report.color === 'blue' ? 'text-blue-900' :
                                  report.color === 'green' ? 'text-green-900' :
                                  'text-gray-900'
                                }`}>Impact Assessment</h5>
                                <p className={`text-xs ${
                                  report.color === 'red' ? 'text-red-700' :
                                  report.color === 'yellow' ? 'text-yellow-700' :
                                  report.color === 'blue' ? 'text-blue-700' :
                                  report.color === 'green' ? 'text-green-700' :
                                  'text-gray-700'
                                }`}>{report.impact}</p>
                              </div>

                              {/* Detailed Information */}
                              {report.details && (
                                <div>
                                  <h5 className={`text-sm font-medium mb-2 ${
                                    report.color === 'red' ? 'text-red-900' :
                                    report.color === 'yellow' ? 'text-yellow-900' :
                                    report.color === 'blue' ? 'text-blue-900' :
                                    report.color === 'green' ? 'text-green-900' :
                                    'text-gray-900'
                                  }`}>Detailed Analysis</h5>
                                  <div className="bg-white/60 rounded p-3 space-y-2">
                                    {Object.entries(report.details).map(([key, value]) => (
                                      <div key={key} className="text-xs">
                                        <span className="font-medium text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                        {Array.isArray(value) ? (
                                          <ul className="mt-1 ml-3 list-disc text-gray-700">
                                            {value.map((item, index) => (
                                              <li key={index}>{item}</li>
                                            ))}
                                          </ul>
                                        ) : (
                                          <span className="text-gray-700 ml-1">{value}</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Recommended Actions */}
                              <div>
                                <h5 className={`text-sm font-medium mb-2 ${
                                  report.color === 'red' ? 'text-red-900' :
                                  report.color === 'yellow' ? 'text-yellow-900' :
                                  report.color === 'blue' ? 'text-blue-900' :
                                  report.color === 'green' ? 'text-green-900' :
                                  'text-gray-900'
                                }`}>Recommended Actions</h5>
                                <div className="space-y-2">
                                  {report.recommendedActions.map((action, index) => (
                                    <div key={index} className="flex items-start space-x-2 text-xs">
                                      <CheckCircle2 className={`w-3 h-3 mt-0.5 ${
                                        report.color === 'red' ? 'text-red-600' :
                                        report.color === 'yellow' ? 'text-yellow-600' :
                                        report.color === 'blue' ? 'text-blue-600' :
                                        report.color === 'green' ? 'text-green-600' :
                                        'text-gray-600'
                                      }`} />
                                      <span className={`${
                                        report.color === 'red' ? 'text-red-700' :
                                        report.color === 'yellow' ? 'text-yellow-700' :
                                        report.color === 'blue' ? 'text-blue-700' :
                                        report.color === 'green' ? 'text-green-700' :
                                        'text-gray-700'
                                      }`}>{action}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Agent Performance & Sources */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Performance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Web Scraping Agent</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">98.3%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Social Media Monitor</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">95.7%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">News & Blog Tracker</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">87.2%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Job Posting Analyzer</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">92.1%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Patent & IP Monitor</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">100%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Intelligence Sources</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Company Blogs</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">34 updates</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Social Media</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">28 mentions</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Job Boards</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">19 postings</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">News & PR</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">15 articles</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">Patent Filings</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">3 new</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Intelligence Tab */}
          {activeTab === 'product-intelligence' && (
            <div className="space-y-6">
              {/* Product Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Products Tracked</h3>
                      <p className="text-2xl font-bold text-blue-600">24</p>
                      <p className="text-xs text-gray-500">across competitors</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Feature Updates</h3>
                      <p className="text-2xl font-bold text-green-600">18</p>
                      <p className="text-xs text-gray-500">this month</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Pricing Changes</h3>
                      <p className="text-2xl font-bold text-purple-600">7</p>
                      <p className="text-xs text-gray-500">recent updates</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Rocket className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">New Launches</h3>
                      <p className="text-2xl font-bold text-orange-600">3</p>
                      <p className="text-xs text-gray-500">last 30 days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Comparison Matrix */}
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <GitCompare className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Feature Comparison Matrix</h3>
                  </div>
                  <button className="text-sm text-indigo-600 hover:text-indigo-800">View Full Matrix</button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Feature Category</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Your Product</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">HubSpot</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Salesforce</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Pipedrive</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">AI/ML Capabilities</td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Advanced
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⚠ Basic
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Advanced
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ✗ None
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">Mobile App</td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ iOS/Android
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ iOS/Android
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ iOS/Android
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ iOS/Android
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">API Access</td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ REST + GraphQL
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⚠ REST Only
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ REST + GraphQL
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⚠ REST Only
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">Enterprise SSO</td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ SAML/OAuth
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ SAML/OAuth
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ SAML/OAuth
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            ⚠ Limited
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pricing Intelligence */}
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Intelligence</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">HubSpot CRM</h4>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">↗ +15%</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">$50/mo</p>
                    <p className="text-sm text-gray-600">Starter Plan • Per Seat</p>
                    <div className="mt-2 text-xs text-gray-500">
                      Last changed: Jan 15, 2024
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Salesforce</h4>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">→ No Change</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">$25/mo</p>
                    <p className="text-sm text-gray-600">Essentials • Per User</p>
                    <div className="mt-2 text-xs text-gray-500">
                      Last changed: Oct 2023
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Pipedrive</h4>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">↘ -10%</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">$14.90/mo</p>
                    <p className="text-sm text-gray-600">Essential Plan • Per User</p>
                    <div className="mt-2 text-xs text-gray-500">
                      Last changed: Dec 15, 2023
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sales & Marketing Intelligence Tab */}
          {activeTab === 'sales-marketing' && (
            <div className="space-y-8">
              {/* Go-to-Market Strategy Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Strategy */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Target className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Sales Strategy Analysis</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-blue-900">Sales Cycle Length</span>
                        <span className="text-sm text-blue-700">HubSpot: 89 days</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">Our average: 67 days (23% faster)</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-green-900">Deal Size (Average)</span>
                        <span className="text-sm text-green-700">Salesforce: $45K</span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <p className="text-xs text-green-700 mt-1">Our average: $38K (16% lower)</p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-purple-900">Win Rate</span>
                        <span className="text-sm text-purple-700">Pipedrive: 28%</span>
                      </div>
                      <div className="w-full bg-purple-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                      <p className="text-xs text-purple-700 mt-1">Our rate: 35% (25% higher)</p>
                    </div>
                  </div>
                </div>

                {/* Marketing Strategy */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Marketing Strategy</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-700">$2.4M</p>
                          <p className="text-xs text-blue-600">Monthly Ad Spend</p>
                          <p className="text-xs text-blue-500 mt-1">HubSpot (est.)</p>
                        </div>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-700">847K</p>
                          <p className="text-xs text-green-600">Blog Visitors/Mo</p>
                          <p className="text-xs text-green-500 mt-1">Zendesk</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-900 mb-2">Content Strategy Focus</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-yellow-700">Educational Content</span>
                          <span className="text-yellow-600">45%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-yellow-700">Product Features</span>
                          <span className="text-yellow-600">30%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-yellow-700">Industry Insights</span>
                          <span className="text-yellow-600">25%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Competitive Positioning Map */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Market Positioning Analysis</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Competitive Quadrant */}
                  <div className="lg:col-span-2">
                    <div className="relative h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-4">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full relative">
                          {/* Axes */}
                          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 transform -translate-x-px"></div>
                          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 transform -translate-y-px"></div>
                          
                          {/* Labels */}
                          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">High Market Share</div>
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">Low Market Share</div>
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 rotate-90 text-xs text-gray-600 origin-center">High Growth</div>
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-gray-600 origin-center">Low Growth</div>
                          
                          {/* Competitors positioned on the map */}
                          <div className="absolute" style={{top: '20%', left: '70%'}}>
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-xs text-gray-700 mt-1">HubSpot</span>
                            </div>
                          </div>
                          
                          <div className="absolute" style={{top: '35%', left: '75%'}}>
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <span className="text-xs text-gray-700 mt-1">Salesforce</span>
                            </div>
                          </div>
                          
                          <div className="absolute" style={{top: '45%', left: '35%'}}>
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-gray-700 mt-1">Pipedrive</span>
                            </div>
                          </div>
                          
                          <div className="absolute" style={{top: '60%', left: '45%'}}>
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 bg-indigo-500 rounded-full border-2 border-indigo-700"></div>
                              <span className="text-xs font-medium text-indigo-700 mt-1">Our Product</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="w-4 h-4 text-blue-600" />
                        <h4 className="font-medium text-blue-900">Market Leaders</h4>
                      </div>
                      <p className="text-sm text-blue-700">HubSpot and Salesforce dominate with high market share and strong growth rates.</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-4 h-4 text-green-600" />
                        <h4 className="font-medium text-green-900">Our Opportunity</h4>
                      </div>
                      <p className="text-sm text-green-700">Positioned well to capture market share with competitive pricing and focused features.</p>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-yellow-600" />
                        <h4 className="font-medium text-yellow-900">Growth Vector</h4>
                      </div>
                      <p className="text-sm text-yellow-700">Focus on SMB segment where enterprise solutions are over-engineered.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Channel & Partnership Intelligence */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Channels */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Share2 className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Sales Channels</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium text-orange-900">Direct Sales</span>
                      <span className="text-sm text-orange-700">60%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-blue-900">Partner Channel</span>
                      <span className="text-sm text-blue-700">25%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-900">Self-Service/PLG</span>
                      <span className="text-sm text-green-700">15%</span>
                    </div>
                  </div>
                </div>

                {/* Recent Partnerships */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Partnership Activity</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Salesforce AppExchange</p>
                        <p className="text-xs text-green-700">HubSpot expanded integration capabilities</p>
                        <p className="text-xs text-green-600">2 weeks ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Activity className="w-4 h-4 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Microsoft Partnership</p>
                        <p className="text-xs text-blue-700">Zendesk announces Teams integration</p>
                        <p className="text-xs text-blue-600">1 month ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <Rocket className="w-4 h-4 text-purple-600 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-purple-900">API Partnership</p>
                        <p className="text-xs text-purple-700">Pipedrive launches marketplace</p>
                        <p className="text-xs text-purple-600">6 weeks ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Process Intelligence */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Activity className="w-5 h-5 text-pink-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Sales Process Comparison</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Stage</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Our Process</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">HubSpot</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Salesforce</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Advantage</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100 bg-green-50">
                        <td className="py-3 px-4 font-medium text-gray-900">Lead Qualification</td>
                        <td className="py-3 px-4 text-center text-sm">2 days</td>
                        <td className="py-3 px-4 text-center text-sm">5 days</td>
                        <td className="py-3 px-4 text-center text-sm">7 days</td>
                        <td className="py-3 px-4 text-center text-sm text-green-700">✓ Us</td>
                      </tr>
                      <tr className="border-b border-gray-100 bg-red-50">
                        <td className="py-3 px-4 font-medium text-gray-900">Demo to Proposal</td>
                        <td className="py-3 px-4 text-center text-sm">14 days</td>
                        <td className="py-3 px-4 text-center text-sm">10 days</td>
                        <td className="py-3 px-4 text-center text-sm">12 days</td>
                        <td className="py-3 px-4 text-center text-sm text-red-700">⚠ Them</td>
                      </tr>
                      <tr className="border-b border-gray-100 bg-green-50">
                        <td className="py-3 px-4 font-medium text-gray-900">Contract Negotiation</td>
                        <td className="py-3 px-4 text-center text-sm">8 days</td>
                        <td className="py-3 px-4 text-center text-sm">15 days</td>
                        <td className="py-3 px-4 text-center text-sm">21 days</td>
                        <td className="py-3 px-4 text-center text-sm text-green-700">✓ Us</td>
                      </tr>
                      <tr className="border-b border-gray-100 bg-yellow-50">
                        <td className="py-3 px-4 font-medium text-gray-900">Onboarding</td>
                        <td className="py-3 px-4 text-center text-sm">21 days</td>
                        <td className="py-3 px-4 text-center text-sm">30 days</td>
                        <td className="py-3 px-4 text-center text-sm">45 days</td>
                        <td className="py-3 px-4 text-center text-sm text-green-700">✓ Us</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Alerts Center Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              {/* Alert Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-lg font-bold text-red-700">3</p>
                      <p className="text-xs text-red-600">Critical Alerts</p>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <BellRing className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-lg font-bold text-amber-700">12</p>
                      <p className="text-xs text-amber-600">New Alerts</p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-lg font-bold text-blue-700">28</p>
                      <p className="text-xs text-blue-600">This Week</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-lg font-bold text-green-700">45</p>
                      <p className="text-xs text-green-600">Resolved</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Alerts */}
              <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
                  <button className="text-sm text-indigo-600 hover:text-indigo-800">View All</button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-red-900">HubSpot launches new AI pricing model</h4>
                        <span className="text-xs text-red-600">2 min ago</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">Significant pricing restructure could impact market positioning</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                    <BellRing className="w-4 h-4 text-amber-600 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-amber-900">Salesforce acquires DataVision Inc</h4>
                        <span className="text-xs text-amber-600">1 hour ago</span>
                      </div>
                      <p className="text-sm text-amber-700 mt-1">Strategic acquisition in the analytics space - monitor integration timeline</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <Activity className="w-4 h-4 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-blue-900">Pipedrive hiring surge detected</h4>
                        <span className="text-xs text-blue-600">3 hours ago</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">50+ new engineering positions posted - possible product expansion</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <TrendingUp className="w-4 h-4 text-green-600 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-green-900">InsightFlow positive review trend</h4>
                        <span className="text-xs text-green-600">6 hours ago</span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">G2 ratings improved 15% - investigate recent feature releases</p>
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
