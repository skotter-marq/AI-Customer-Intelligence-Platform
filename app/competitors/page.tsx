'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  ArrowUpDown,
  Grid3X3,
  List
} from 'lucide-react';

interface CompetitorProfile {
  id: string;
  name: string;
  logo: string;
  industry: string;
  description: string;
  website: string;
  marketCap: string;
  employees: string;
  founded: string;
  headquarters: string;
  status: 'active' | 'monitoring' | 'inactive';
  threat_level: 'high' | 'medium' | 'low';
  confidence_score: number;
  last_analyzed: string;
  financial_metrics: {
    revenue: string;
    growth_rate: string;
    profit_margin: string;
    market_share: string;
  };
  social_metrics: {
    linkedin_followers: number;
    twitter_followers: number;
    engagement_rate: number;
    sentiment_score: number;
  };
  recent_news: Array<{
    title: string;
    date: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    source: string;
  }>;
  competitive_advantages: string[];
  weaknesses: string[];
  recent_activities: Array<{
    type: string;
    title: string;
    date: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

export default function CompetitorsPage() {
  const router = useRouter();
  const [competitors, setCompetitors] = useState<CompetitorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [threatFilter, setThreatFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'monitoring' | 'inactive'>('all');
  const [grouping, setGrouping] = useState<'none' | 'threat' | 'industry' | 'size'>('none');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'name' | 'threat' | 'last_analyzed' | 'confidence'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Mock competitors data
  const mockCompetitors: CompetitorProfile[] = [
    {
      id: 'salesforce',
      name: 'Salesforce',
      logo: 'https://logo.clearbit.com/salesforce.com',
      industry: 'CRM & Sales',
      description: 'Leading cloud-based CRM platform with comprehensive sales, service, and marketing solutions.',
      website: 'https://salesforce.com',
      marketCap: '$220B',
      employees: '73,000+',
      founded: '1999',
      headquarters: 'San Francisco, CA',
      status: 'active',
      threat_level: 'high',
      confidence_score: 0.95,
      last_analyzed: '2024-01-15T14:30:00Z',
      financial_metrics: {
        revenue: '$31.4B',
        growth_rate: '+26%',
        profit_margin: '2.1%',
        market_share: '19.8%'
      },
      social_metrics: {
        linkedin_followers: 2800000,
        twitter_followers: 500000,
        engagement_rate: 0.048,
        sentiment_score: 0.72
      },
      recent_news: [
        {
          title: 'Salesforce Announces AI Cloud Expansion',
          date: '2024-01-14',
          sentiment: 'positive',
          source: 'TechCrunch'
        },
        {
          title: 'Q4 Earnings Beat Expectations',
          date: '2024-01-12',
          sentiment: 'positive',
          source: 'Forbes'
        }
      ],
      competitive_advantages: [
        'Market leader with extensive ecosystem',
        'Strong AI/ML capabilities with Einstein',
        'Comprehensive platform integration',
        'Large developer community'
      ],
      weaknesses: [
        'High pricing for small businesses',
        'Complex implementation process',
        'Steep learning curve for new users'
      ],
      recent_activities: [
        {
          type: 'product_launch',
          title: 'Einstein GPT Integration',
          date: '2024-01-10',
          impact: 'high'
        },
        {
          type: 'acquisition',
          title: 'Data.com Enhancement',
          date: '2024-01-08',
          impact: 'medium'
        }
      ]
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      logo: 'https://logo.clearbit.com/hubspot.com',
      industry: 'Inbound Marketing',
      description: 'Inbound marketing, sales, and service platform helping businesses attract and convert leads.',
      website: 'https://hubspot.com',
      marketCap: '$28B',
      employees: '5,000+',
      founded: '2006',
      headquarters: 'Cambridge, MA',
      status: 'active',
      threat_level: 'high',
      confidence_score: 0.89,
      last_analyzed: '2024-01-15T16:00:00Z',
      financial_metrics: {
        revenue: '$1.7B',
        growth_rate: '+32%',
        profit_margin: '8.4%',
        market_share: '12.1%'
      },
      social_metrics: {
        linkedin_followers: 1200000,
        twitter_followers: 280000,
        engagement_rate: 0.065,
        sentiment_score: 0.81
      },
      recent_news: [
        {
          title: 'HubSpot Launches Advanced AI Features',
          date: '2024-01-13',
          sentiment: 'positive',
          source: 'MarketingLand'
        }
      ],
      competitive_advantages: [
        'Strong inbound marketing methodology',
        'User-friendly interface and onboarding',
        'Freemium model attracts SMBs',
        'Comprehensive educational resources'
      ],
      weaknesses: [
        'Limited customization compared to enterprise solutions',
        'Reporting capabilities could be stronger',
        'Advanced features require higher tiers'
      ],
      recent_activities: [
        {
          type: 'feature_update',
          title: 'AI-Powered Content Assistant',
          date: '2024-01-12',
          impact: 'high'
        }
      ]
    },
    {
      id: 'pipedrive',
      name: 'Pipedrive',
      logo: 'https://logo.clearbit.com/pipedrive.com',
      industry: 'Sales CRM',
      description: 'Sales-focused CRM designed to help small and medium businesses manage their sales processes.',
      website: 'https://pipedrive.com',
      marketCap: '$1.5B',
      employees: '1,000+',
      founded: '2010',
      headquarters: 'Tallinn, Estonia',
      status: 'monitoring',
      threat_level: 'medium',
      confidence_score: 0.76,
      last_analyzed: '2024-01-14T10:15:00Z',
      financial_metrics: {
        revenue: '$127M',
        growth_rate: '+41%',
        profit_margin: '15.2%',
        market_share: '3.2%'
      },
      social_metrics: {
        linkedin_followers: 180000,
        twitter_followers: 45000,
        engagement_rate: 0.042,
        sentiment_score: 0.74
      },
      recent_news: [
        {
          title: 'Pipedrive Expands European Operations',
          date: '2024-01-11',
          sentiment: 'positive',
          source: 'SaaS News'
        }
      ],
      competitive_advantages: [
        'Simple, intuitive pipeline management',
        'Strong focus on sales teams',
        'Competitive pricing for SMBs',
        'European data compliance'
      ],
      weaknesses: [
        'Limited marketing automation features',
        'Basic reporting compared to enterprise tools',
        'Fewer integrations than larger competitors'
      ],
      recent_activities: [
        {
          type: 'market_expansion',
          title: 'New APAC Offices',
          date: '2024-01-09',
          impact: 'medium'
        }
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setCompetitors(mockCompetitors);
      setLoading(false);
    }, 1000);
  }, []);

  // Export functionality
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Generate Executive Summary data
  const generateExecutiveSummary = (competitors: CompetitorProfile[]) => {
    return competitors.map(comp => ({
      'Company': comp.name,
      'Threat Level': comp.threat_level.toUpperCase(),
      'Industry': comp.industry,
      'Market Cap': comp.marketCap,
      'Revenue': comp.financial_metrics.revenue,
      'Growth Rate': comp.financial_metrics.growth_rate,
      'Market Share': comp.financial_metrics.market_share,
      'Employees': comp.employees,
      'Key Advantage': comp.competitive_advantages[0] || 'N/A',
      'Top Weakness': comp.weaknesses[0] || 'N/A',
      'Confidence Score': `${Math.round(comp.confidence_score * 100)}%`,
      'Last Updated': new Date(comp.last_analyzed).toLocaleDateString()
    }));
  };

  // Generate Detailed Analysis data
  const generateDetailedAnalysis = (competitors: CompetitorProfile[]) => {
    return competitors.map(comp => ({
      'Company Name': comp.name,
      'Website': comp.website,
      'Industry': comp.industry,
      'Description': comp.description,
      'Headquarters': comp.headquarters,
      'Founded': comp.founded,
      'Employees': comp.employees,
      'Market Cap': comp.marketCap,
      'Revenue': comp.financial_metrics.revenue,
      'Growth Rate': comp.financial_metrics.growth_rate,
      'Profit Margin': comp.financial_metrics.profit_margin,
      'Market Share': comp.financial_metrics.market_share,
      'Threat Level': comp.threat_level.toUpperCase(),
      'Monitoring Status': comp.status.toUpperCase(),
      'Confidence Score': comp.confidence_score,
      'LinkedIn Followers': comp.social_metrics.linkedin_followers.toLocaleString(),
      'Twitter Followers': comp.social_metrics.twitter_followers.toLocaleString(),
      'Engagement Rate': `${(comp.social_metrics.engagement_rate * 100).toFixed(1)}%`,
      'Sentiment Score': `${(comp.social_metrics.sentiment_score * 100).toFixed(0)}%`,
      'Competitive Advantages': comp.competitive_advantages.join('; '),
      'Weaknesses': comp.weaknesses.join('; '),
      'Last Analyzed': new Date(comp.last_analyzed).toLocaleDateString()
    }));
  };

  // Generate News & Activities data
  const generateNewsActivities = (competitors: CompetitorProfile[]) => {
    const newsData: any[] = [];
    
    competitors.forEach(comp => {
      // Add recent news
      comp.recent_news.forEach(news => {
        newsData.push({
          'Company': comp.name,
          'Type': 'News',
          'Title': news.title,
          'Date': news.date,
          'Sentiment': news.sentiment.toUpperCase(),
          'Source': news.source,
          'Impact': 'N/A'
        });
      });
      
      // Add recent activities
      comp.recent_activities.forEach(activity => {
        newsData.push({
          'Company': comp.name,
          'Type': 'Activity',
          'Title': activity.title,
          'Date': activity.date,
          'Sentiment': 'N/A',
          'Source': activity.type.replace('_', ' ').toUpperCase(),
          'Impact': activity.impact.toUpperCase()
        });
      });
    });
    
    return newsData.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
  };

  // Generate Competitive Matrix data
  const generateCompetitiveMatrix = (competitors: CompetitorProfile[]) => {
    const matrix: any = {};
    
    // Create a matrix with companies as rows and metrics as columns
    competitors.forEach(comp => {
      matrix[comp.name] = {
        'Industry': comp.industry,
        'Threat Level': comp.threat_level.toUpperCase(),
        'Market Cap': comp.marketCap,
        'Revenue': comp.financial_metrics.revenue,
        'Growth Rate': comp.financial_metrics.growth_rate,
        'Market Share': comp.financial_metrics.market_share,
        'Employees': comp.employees,
        'LinkedIn Followers': comp.social_metrics.linkedin_followers.toLocaleString(),
        'Engagement Rate': `${(comp.social_metrics.engagement_rate * 100).toFixed(1)}%`,
        'Sentiment Score': `${(comp.social_metrics.sentiment_score * 100).toFixed(0)}%`,
        'Confidence Score': `${Math.round(comp.confidence_score * 100)}%`,
        'Founded': comp.founded,
        'Headquarters': comp.headquarters
      };
    });
    
    return Object.entries(matrix).map(([company, data]) => ({
      'Company': company,
      ...(data as Record<string, any>)
    }));
  };

  // Convert array of objects to CSV
  const arrayToCSV = (data: any[], filename: string) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  // Download file
  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Export handlers
  const handleExportCSV = (dataType: 'summary' | 'detailed' | 'news' | 'matrix') => {
    const timestamp = new Date().toISOString().split('T')[0];
    let data: any[] = [];
    let filename = '';

    switch (dataType) {
      case 'summary':
        data = generateExecutiveSummary(filteredCompetitors);
        filename = `competitor-executive-summary-${timestamp}.csv`;
        break;
      case 'detailed':
        data = generateDetailedAnalysis(filteredCompetitors);
        filename = `competitor-detailed-analysis-${timestamp}.csv`;
        break;
      case 'news':
        data = generateNewsActivities(filteredCompetitors);
        filename = `competitor-news-activities-${timestamp}.csv`;
        break;
      case 'matrix':
        data = generateCompetitiveMatrix(filteredCompetitors);
        filename = `competitive-matrix-${timestamp}.csv`;
        break;
    }

    const csvContent = arrayToCSV(data, filename);
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    setShowExportMenu(false);
  };

  const handleExportJSON = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const exportData = {
      export_date: new Date().toISOString(),
      total_competitors: filteredCompetitors.length,
      executive_summary: generateExecutiveSummary(filteredCompetitors),
      detailed_analysis: generateDetailedAnalysis(filteredCompetitors),
      news_activities: generateNewsActivities(filteredCompetitors),
      competitive_matrix: generateCompetitiveMatrix(filteredCompetitors)
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, `competitor-intelligence-${timestamp}.json`, 'application/json');
    setShowExportMenu(false);
  };

  const handleExportAll = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Export all as separate CSV files
    handleExportCSV('summary');
    setTimeout(() => handleExportCSV('detailed'), 100);
    setTimeout(() => handleExportCSV('news'), 200);
    setTimeout(() => handleExportCSV('matrix'), 300);
    
    setShowExportMenu(false);
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'calendly-badge-danger';
      case 'medium': return 'calendly-badge-warning';
      case 'low': return 'calendly-badge-success';
      default: return 'calendly-badge-info';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'calendly-badge-success';  
      case 'monitoring': return 'calendly-badge-warning';
      case 'inactive': return 'calendly-badge-info';
      default: return 'calendly-badge-info';
    }
  };

  const filteredCompetitors = competitors.filter(competitor => {
    const matchesSearch = !searchQuery || 
      competitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      competitor.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      competitor.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesThreat = threatFilter === 'all' || competitor.threat_level === threatFilter;
    const matchesStatus = statusFilter === 'all' || competitor.status === statusFilter;
    
    return matchesSearch && matchesThreat && matchesStatus;
  });

  const handleCompetitorClick = (competitorId: string) => {
    router.push(`/competitor-intelligence/competitors/${competitorId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#4285f4' }}></div>
                <p className="calendly-body mt-4">Loading competitors...</p>
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
              <h1 className="calendly-h1">Competitors</h1>
              <p className="calendly-body">Monitor and analyze competitor activities and market positioning</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* Export Menu */}
              <div className="relative">
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="calendly-btn-secondary flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Export Competitor Intelligence</h3>
                      
                      {/* CSV Exports */}
                      <div className="space-y-2 mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">CSV Reports</h4>
                        <button
                          onClick={() => handleExportCSV('summary')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">Executive Summary</div>
                            <div className="text-xs text-gray-500">Key metrics & threat levels</div>
                          </div>
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportCSV('detailed')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">Detailed Analysis</div>
                            <div className="text-xs text-gray-500">Complete competitor profiles</div>
                          </div>
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportCSV('news')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">News & Activities</div>
                            <div className="text-xs text-gray-500">Recent developments & activities</div>
                          </div>
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportCSV('matrix')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">Competitive Matrix</div>
                            <div className="text-xs text-gray-500">Side-by-side comparison</div>
                          </div>
                          <Download className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Complete Export</h4>
                        <button
                          onClick={handleExportJSON}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-between mb-2"
                        >
                          <div>
                            <div className="font-medium">JSON Data Export</div>
                            <div className="text-xs text-gray-500">All data in structured format</div>
                          </div>
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleExportAll}
                          className="w-full text-left px-3 py-2 text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">Export All (CSV)</div>
                            <div className="text-xs text-indigo-600">Download all 4 CSV reports</div>
                          </div>
                          <Package className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                        Exporting {filteredCompetitors.length} competitors
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Click outside to close */}
                {showExportMenu && (
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowExportMenu(false)}
                  />
                )}
              </div>
              <button 
                onClick={() => router.push('/competitor-intelligence/add-competitor')}
                className="calendly-btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Competitor</span>
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
                    placeholder="Search competitors, industries, or descriptions..."
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
                  <AlertTriangle className="w-4 h-4" style={{ color: '#718096' }} />
                  <select
                    value={threatFilter}
                    onChange={(e) => setThreatFilter(e.target.value as any)}
                    className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                    style={{ border: '1px solid #e2e8f0', background: 'white' }}
                  >
                    <option value="all">All Threat Levels</option>
                    <option value="high">High Threat</option>
                    <option value="medium">Medium Threat</option>
                    <option value="low">Low Threat</option>
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
                    <option value="monitoring">Monitoring</option>
                    <option value="inactive">Inactive</option>
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

          {/* Competitors Display */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompetitors.map((competitor) => (
                <div
                  key={competitor.id}
                  onClick={() => handleCompetitorClick(competitor.id)}
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
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                        {competitor.logo ? (
                          <img src={competitor.logo} alt={competitor.name} className="w-8 h-8 rounded" />
                        ) : (
                          <Building className="w-6 h-6" style={{ color: '#4285f4' }} />
                        )}
                      </div>
                      <div>
                        <h3 className="calendly-h3" style={{ marginBottom: '2px' }}>{competitor.name}</h3>
                        <p className="calendly-label-sm">{competitor.industry}</p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className={`calendly-badge ${getThreatLevelColor(competitor.threat_level)}`}>
                        {competitor.threat_level} threat
                      </span>
                      <span className={`calendly-badge ${getStatusColor(competitor.status)}`}>
                        {competitor.status}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="calendly-body-sm line-clamp-2" style={{ marginBottom: '16px' }}>
                    {competitor.description}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '16px' }}>
                    <div>
                      <p className="calendly-label-sm">Market Cap</p>
                      <p className="calendly-body font-medium">{competitor.marketCap}</p>
                    </div>
                    <div>
                      <p className="calendly-label-sm">Employees</p>
                      <p className="calendly-body font-medium">{competitor.employees}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full" style={{ 
                        background: competitor.confidence_score > 0.8 ? '#10b981' : 
                                   competitor.confidence_score > 0.6 ? '#f59e0b' : '#ef4444' 
                      }}></div>
                      <span className="calendly-label-sm">
                        {Math.round(competitor.confidence_score * 100)}% confidence
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4" style={{ color: '#718096' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="calendly-card" style={{ padding: 0 }}>
              <div className="overflow-x-auto">
                <table className="calendly-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Industry</th>
                      <th>Threat Level</th>
                      <th>Status</th>
                      <th>Market Cap</th>
                      <th>Confidence</th>
                      <th>Last Analyzed</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompetitors.map((competitor) => (
                      <tr key={competitor.id} className="cursor-pointer" onClick={() => handleCompetitorClick(competitor.id)}>
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                              {competitor.logo ? (
                                <img src={competitor.logo} alt={competitor.name} className="w-6 h-6 rounded" />
                              ) : (
                                <Building className="w-4 h-4" style={{ color: '#4285f4' }} />
                              )}
                            </div>
                            <span className="font-medium">{competitor.name}</span>
                          </div>
                        </td>
                        <td>{competitor.industry}</td>
                        <td>
                          <span className={`calendly-badge ${getThreatLevelColor(competitor.threat_level)}`}>
                            {competitor.threat_level}
                          </span>
                        </td>
                        <td>
                          <span className={`calendly-badge ${getStatusColor(competitor.status)}`}>
                            {competitor.status}
                          </span>
                        </td>
                        <td>{competitor.marketCap}</td>
                        <td>{Math.round(competitor.confidence_score * 100)}%</td>
                        <td>{new Date(competitor.last_analyzed).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(competitor.website, '_blank');
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
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredCompetitors.length === 0 && (
            <div className="calendly-card text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
              <h3 className="calendly-h3" style={{ marginBottom: '8px' }}>No competitors found</h3>
              <p className="calendly-body" style={{ marginBottom: '24px' }}>
                {searchQuery || threatFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by adding your first competitor'}
              </p>
              <button 
                onClick={() => router.push('/competitor-intelligence/add-competitor')}
                className="calendly-btn-primary"
              >
                Add Competitor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}