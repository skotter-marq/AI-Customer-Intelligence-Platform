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
  DollarSign
} from 'lucide-react';

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
  const [metrics, setMetrics] = useState<IntelligenceMetrics>({
    total_competitors: 0,
    active_monitoring: 0,
    high_threat: 0,
    new_insights: 0,
    market_share_change: 0
  });
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [insightFilter, setInsightFilter] = useState<'all' | 'pricing' | 'feature' | 'marketing' | 'hiring' | 'funding'>('all');
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
          last_updated: '2024-01-15T10:30:00Z'
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
          last_updated: '2024-01-15T09:15:00Z'
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

      setCompetitors(mockCompetitors);
      setInsights(mockInsights);
      
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading competitor intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Competitor Intelligence</h1>
            <p className="text-gray-600">Monitor competitive landscape and market insights</p>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
          </div>

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