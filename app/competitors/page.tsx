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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [sortBy, setSortBy] = useState<'name' | 'threat' | 'last_analyzed' | 'confidence'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);


  useEffect(() => {
    loadCompetitors();
  }, [threatFilter, statusFilter]);

  const loadCompetitors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (threatFilter !== 'all') params.append('threat_level', threatFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/competitors?${params.toString()}`);
      const data = await response.json();
      
      if (data.competitors) {
        // Transform API data to match UI interface
        const transformedCompetitors: CompetitorProfile[] = data.competitors.map((comp: any) => ({
          id: comp.id,
          name: comp.name,
          logo: comp.logo_url,
          industry: comp.industry,
          description: comp.description,
          website: comp.website_url,
          marketCap: comp.market_cap || 'N/A',
          employees: comp.employees || 'N/A',
          founded: comp.founded_year?.toString() || 'N/A',
          headquarters: comp.headquarters || 'Unknown',
          threat_level: comp.threat_level,
          status: comp.status,
          confidence_score: comp.confidence_score || 0.5,
          last_analyzed: comp.last_analyzed_at || comp.updated_at,
          insights_count: comp.insights_count || 0,
          recent_insights: comp.recent_insights || []
        }));
        
        setCompetitors(transformedCompetitors);
      } else {
        console.error('Failed to load competitors:', data.error);
        setCompetitors([]);
      }
    } catch (error) {
      console.error('Error loading competitors:', error);
      setCompetitors([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDeleteCompetitor = async (competitorId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (confirm('Are you sure you want to delete this competitor? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/competitors?id=${competitorId}`, { 
          method: 'DELETE' 
        });
        
        if (response.ok) {
          // Remove from local state
          setCompetitors(prev => prev.filter(competitor => competitor.id !== competitorId));
        } else {
          const data = await response.json();
          console.error('Failed to delete competitor:', data.error);
          alert('Failed to delete competitor. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting competitor:', error);
        alert('Failed to delete competitor. Please try again.');
      }
    }
  };

  const handleSelectCompetitor = (competitorId: string) => {
    setSelectedCompetitors(prev => 
      prev.includes(competitorId) 
        ? prev.filter(id => id !== competitorId)
        : [...prev, competitorId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedCompetitors.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedCompetitors.length} competitor${selectedCompetitors.length !== 1 ? 's' : ''}? This action cannot be undone.`)) {
      try {
        const promises = selectedCompetitors.map(id => 
          fetch(`/api/competitors?id=${id}`, { method: 'DELETE' })
        );
        
        await Promise.all(promises);
        
        // Remove from local state
        setCompetitors(prev => prev.filter(c => !selectedCompetitors.includes(c.id)));
        setSelectedCompetitors([]);
      } catch (error) {
        console.error('Error bulk deleting competitors:', error);
        alert('Failed to delete competitors. Please try again.');
      }
    }
  };

  const handleBulkStatusChange = async (newStatus: 'active' | 'monitoring' | 'inactive') => {
    if (selectedCompetitors.length === 0) return;
    
    try {
      // Update local state optimistically
      setCompetitors(prev => prev.map(competitor => 
        selectedCompetitors.includes(competitor.id) 
          ? { ...competitor, status: newStatus }
          : competitor
      ));
      
      setSelectedCompetitors([]);
      
      // Here you would make API calls to update the status
      // For now, just show success
      console.log(`Updated ${selectedCompetitors.length} competitors to ${newStatus}`);
    } catch (error) {
      console.error('Error bulk updating competitors:', error);
      alert('Failed to update competitors. Please try again.');
    }
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {filteredCompetitors.map((competitor) => (
                <div
                  key={competitor.id}
                  onClick={() => handleCompetitorClick(competitor.id)}
                  className="calendly-card cursor-pointer transition-all duration-200 group h-[450px] flex flex-col"
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
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#f1f5f9' }}>
                        {competitor.logo ? (
                          <img src={competitor.logo} alt={competitor.name} className="w-8 h-8 rounded" />
                        ) : (
                          <Building className="w-6 h-6" style={{ color: '#4285f4' }} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{competitor.name}</h3>
                        <p className="text-sm text-gray-600 truncate">{competitor.industry}</p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1 ml-3">
                      <span className={`calendly-badge text-xs ${getThreatLevelColor(competitor.threat_level)}`}>
                        {competitor.threat_level}
                      </span>
                      <span className={`calendly-badge text-xs ${getStatusColor(competitor.status)}`}>
                        {competitor.status}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-4 flex-1">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Company Overview</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {competitor.description}
                    </p>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center text-blue-700 mb-1">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Market Cap</span>
                      </div>
                      <p className="text-lg font-semibold text-blue-900">{competitor.marketCap}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center text-green-700 mb-1">
                        <Users className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Employees</span>
                      </div>
                      <p className="text-lg font-semibold text-green-900">{competitor.employees}</p>
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div className="bg-gray-100 p-3 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ 
                          background: competitor.confidence_score > 0.8 ? '#10b981' : 
                                     competitor.confidence_score > 0.6 ? '#f59e0b' : '#ef4444' 
                        }}></div>
                        <span className="text-sm font-medium text-gray-700">Data Confidence</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {Math.round(competitor.confidence_score * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${competitor.confidence_score * 100}%`,
                          background: competitor.confidence_score > 0.8 ? '#10b981' : 
                                     competitor.confidence_score > 0.6 ? '#f59e0b' : '#ef4444' 
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex justify-end pt-3 mt-auto border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(competitor.website, '_blank');
                        }}
                        className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                        title="Visit website"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        Website
                      </button>
                      <button
                        onClick={(e) => handleDeleteCompetitor(competitor.id, e)}
                        className="flex items-center text-red-600 hover:text-red-800 font-medium text-sm"
                        title="Delete competitor"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
            {/* Bulk Actions Toolbar */}
            {selectedCompetitors.length > 0 && (
              <div className="p-4 mb-4 flex items-center justify-between" style={{
                background: '#dbeafe',
                border: '1px solid #93c5fd', 
                borderRadius: '12px'
              }}>
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-blue-900">
                    {selectedCompetitors.length} competitor{selectedCompetitors.length !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBulkStatusChange('active')}
                      className="calendly-btn-primary flex items-center space-x-1"
                    >
                      <Activity className="w-4 h-4" />
                      <span className="text-sm font-medium">Set Active</span>
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange('monitoring')}
                      className="calendly-btn-secondary flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Set Monitor</span>
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="calendly-btn-secondary flex items-center space-x-1 !text-red-600 !border-red-200 hover:!bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Delete All</span>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCompetitors([])}
                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Clear selection"
                >
                  <X className="w-4 h-4 text-blue-700" />
                </button>
              </div>
            )}
            
            {/* Enhanced List View */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {filteredCompetitors.map((competitor) => (
                  <div
                    key={competitor.id}
                    onClick={() => handleCompetitorClick(competitor.id)}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer relative"
                  >
                    {/* Selection Circle */}
                    <div className="absolute top-6 left-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCompetitor(competitor.id);
                        }}
                        className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                          selectedCompetitors.includes(competitor.id)
                            ? 'bg-blue-600 border-blue-600 shadow-lg'
                            : 'bg-white border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {selectedCompetitors.includes(competitor.id) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </button>
                    </div>

                    <div className="ml-8">
                    <div className="flex items-center justify-between">
                      {/* Left Content */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                              {competitor.logo ? (
                                <img src={competitor.logo} alt={competitor.name} className="w-8 h-8 rounded" />
                              ) : (
                                <Building className="w-5 h-5" style={{ color: '#4285f4' }} />
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">{competitor.name}</h3>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getThreatLevelColor(competitor.threat_level)}`}>
                              {competitor.threat_level}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(competitor.status)}`}>
                              {competitor.status}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-1 mb-3">{competitor.description}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Building className="w-4 h-4" />
                            <span>{competitor.industry}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{competitor.marketCap}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{competitor.employees}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="w-4 h-4" />
                            <span>{Math.round(competitor.confidence_score * 100)}% confidence</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(competitor.last_analyzed).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center space-x-3 ml-6">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompetitorClick(competitor.id);
                          }}
                          className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(competitor.website, '_blank');
                          }}
                          className="flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                          title="Visit website"
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          Website
                        </button>
                        <button
                          onClick={(e) => handleDeleteCompetitor(competitor.id, e)}
                          className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete competitor"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </>
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