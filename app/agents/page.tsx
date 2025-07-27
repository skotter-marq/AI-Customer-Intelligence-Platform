'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bot,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Eye,
  Settings,
  Download,
  ChevronDown,
  Plus,
  Edit,
  Zap,
  Activity,
  BarChart3,
  TrendingUp,
  Play,
  Pause,
  StopCircle,
  RefreshCw,
  Target,
  Bell,
  Globe,
  MessageSquare,
  DollarSign,
  Users,
  Package,
  ArrowUpDown,
  Grid3X3,
  List,
  ExternalLink
} from 'lucide-react';

interface AgentConfiguration {
  keywords: string[];
  sources: string[];
  frequency: string;
  notification_threshold: number;
  data_retention_days: number;
}

interface IntelligenceAgent {
  id: string;
  name: string;
  description: string;
  type: 'pricing' | 'features' | 'news' | 'hiring' | 'social' | 'funding' | 'products' | 'renewal' | 'health' | 'onboarding' | 'expansion';
  status: 'active' | 'paused' | 'error' | 'stopped';
  competitor_ids: string[];
  schedule: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'on_trigger';
  success_rate: number;
  total_insights: number;
  insights_this_week: number;
  last_run: string;
  next_run: string;
  configuration: AgentConfiguration;
  created_date: string;
  performance_trend: 'up' | 'down' | 'stable';
  // Customer account assignments
  assigned_accounts?: {
    account_id: string;
    company_name: string;
    assigned_date: string;
    purpose: string;
    status: 'active' | 'paused' | 'completed';
    next_contact: string;
    contact_attempts: number;
    last_interaction: string;
  }[];
}

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<IntelligenceAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'pricing' | 'features' | 'news' | 'hiring' | 'social' | 'funding' | 'products' | 'renewal' | 'health' | 'onboarding' | 'expansion'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'error' | 'stopped'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'success_rate' | 'insights'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [agentActivities, setAgentActivities] = useState<{[key: string]: any}>({});
  const [lastActivityUpdate, setLastActivityUpdate] = useState<number>(Date.now());

  // Export functionality
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Mock agents data
  const mockAgents: IntelligenceAgent[] = [
    {
      id: 'pricing-monitor',
      name: 'Pricing Monitor',
      description: 'Tracks competitor pricing changes and promotional activities across multiple channels.',
      type: 'pricing',
      status: 'active',
      competitor_ids: ['salesforce', 'hubspot', 'pipedrive'],
      schedule: 'daily',
      success_rate: 0.94,
      total_insights: 247,
      insights_this_week: 12,
      last_run: '2024-01-15T08:00:00Z',
      next_run: '2024-01-16T08:00:00Z',
      configuration: {
        keywords: ['pricing', 'discount', 'promotion', 'free trial'],
        sources: ['website', 'pricing_pages', 'press_releases'],
        frequency: 'daily',
        notification_threshold: 0.15,
        data_retention_days: 90
      },
      created_date: '2023-11-15',
      performance_trend: 'up'
    },
    {
      id: 'feature-tracker',
      name: 'Feature Tracker',
      description: 'Monitors new feature announcements and product updates from key competitors.',
      type: 'features',
      status: 'active',
      competitor_ids: ['salesforce', 'hubspot'],
      schedule: 'weekly',
      success_rate: 0.87,
      total_insights: 156,
      insights_this_week: 8,
      last_run: '2024-01-14T10:00:00Z',
      next_run: '2024-01-21T10:00:00Z',
      configuration: {
        keywords: ['new feature', 'product update', 'announcement', 'release'],
        sources: ['blog', 'changelog', 'social_media'],
        frequency: 'weekly',
        notification_threshold: 0.20,
        data_retention_days: 120
      },
      created_date: '2023-10-20',
      performance_trend: 'stable'
    },
    {
      id: 'news-sentinel',
      name: 'News Sentinel',
      description: 'Aggregates news coverage and media mentions of competitors for market intelligence.',
      type: 'news',
      status: 'active',
      competitor_ids: ['salesforce', 'hubspot', 'pipedrive'],
      schedule: 'hourly',
      success_rate: 0.76,
      total_insights: 892,
      insights_this_week: 34,
      last_run: '2024-01-15T14:00:00Z',
      next_run: '2024-01-15T15:00:00Z',
      configuration: {
        keywords: ['acquisition', 'funding', 'partnership', 'expansion'],
        sources: ['news_sites', 'press_releases', 'industry_publications'],
        frequency: 'hourly',
        notification_threshold: 0.10,
        data_retention_days: 60
      },
      created_date: '2023-09-10',
      performance_trend: 'up'
    },
    {
      id: 'hiring-insights',
      name: 'Hiring Insights',
      description: 'Analyzes competitor job postings to understand strategic hiring and expansion plans.',
      type: 'hiring',
      status: 'paused',
      competitor_ids: ['salesforce', 'hubspot'],
      schedule: 'weekly',
      success_rate: 0.91,
      total_insights: 203,
      insights_this_week: 0,   
      last_run: '2024-01-08T12:00:00Z',
      next_run: '2024-01-22T12:00:00Z',
      configuration: {
        keywords: ['engineer', 'sales', 'product manager', 'remote'],
        sources: ['linkedin', 'company_careers', 'job_boards'],
        frequency: 'weekly',
        notification_threshold: 0.25,
        data_retention_days: 180
      },
      created_date: '2023-12-01',
      performance_trend: 'down'
    },
    {
      id: 'social-pulse',
      name: 'Social Pulse',
      description: 'Monitors social media sentiment and engagement patterns for competitive analysis.',
      type: 'social',
      status: 'active',
      competitor_ids: ['salesforce', 'hubspot', 'pipedrive'],
      schedule: 'daily',
      success_rate: 0.83,
      total_insights: 445,
      insights_this_week: 18,
      last_run: '2024-01-15T06:00:00Z',
      next_run: '2024-01-16T06:00:00Z',
      configuration: {
        keywords: ['customer', 'review', 'complaint', 'praise'],
        sources: ['twitter', 'linkedin', 'reddit', 'review_sites'],
        frequency: 'daily',
        notification_threshold: 0.30,
        data_retention_days: 45
      },
      created_date: '2023-11-30',
      performance_trend: 'stable'
    },
    {
      id: 'funding-radar',
      name: 'Funding Radar',
      description: 'Tracks funding rounds and investment activities in the competitive landscape.',
      type: 'funding',
      status: 'error',
      competitor_ids: ['pipedrive'],
      schedule: 'monthly',
      success_rate: 0.62,
      total_insights: 28,
      insights_this_week: 0,
      last_run: '2024-01-01T00:00:00Z',
      next_run: '2024-02-01T00:00:00Z',
      configuration: {
        keywords: ['funding', 'investment', 'series', 'venture'],
        sources: ['crunchbase', 'techcrunch', 'venture_databases'],
        frequency: 'monthly',
        notification_threshold: 0.50,
        data_retention_days: 365
      },
      created_date: '2023-08-15',
      performance_trend: 'down'
    },
    // Customer Account Agents
    {
      id: 'agent-renewal-001',
      name: 'Renewal Outreach Agent',
      description: 'Proactively contacts accounts approaching renewal dates to schedule discussions and prevent churn.',
      type: 'renewal',
      status: 'active',
      competitor_ids: [],
      schedule: 'daily',
      success_rate: 0.92,
      total_insights: 45,
      insights_this_week: 8,
      last_run: '2024-01-15T09:00:00Z',
      next_run: '2024-01-16T09:00:00Z',
      configuration: {
        keywords: ['renewal', 'contract', 'expiration'],
        sources: ['email', 'phone', 'linkedin'],
        frequency: 'daily',
        notification_threshold: 0.80,
        data_retention_days: 365
      },
      created_date: '2024-01-01',
      performance_trend: 'up',
      assigned_accounts: [
        {
          account_id: 'ACC-MKT-001',
          company_name: 'MarketingCorp',
          assigned_date: '2024-01-10',
          purpose: 'Schedule renewal discussion',
          status: 'active',
          next_contact: '2024-01-18',
          contact_attempts: 2,
          last_interaction: '2024-01-15'
        }
      ]
    },
    {
      id: 'agent-health-001',
      name: 'Health Recovery Agent',
      description: 'Engages with at-risk accounts to improve health scores and prevent churn through targeted outreach.',
      type: 'health',
      status: 'active',
      competitor_ids: [],
      schedule: 'daily',
      success_rate: 0.78,
      total_insights: 23,
      insights_this_week: 5,
      last_run: '2024-01-15T10:00:00Z',
      next_run: '2024-01-16T10:00:00Z',
      configuration: {
        keywords: ['health', 'engagement', 'usage'],
        sources: ['email', 'phone'],
        frequency: 'daily',
        notification_threshold: 0.70,
        data_retention_days: 180
      },
      created_date: '2024-01-05',
      performance_trend: 'stable',
      assigned_accounts: [
        {
          account_id: 'ACC-FIN-005',
          company_name: 'FinancePlus',
          assigned_date: '2024-01-12',
          purpose: 'Improve account health and engagement',
          status: 'active',
          next_contact: '2024-01-16',
          contact_attempts: 1,
          last_interaction: '2024-01-14'
        }
      ]
    },
    {
      id: 'agent-onboard-001',
      name: 'Onboarding Agent',
      description: 'Guides new customers through product adoption and ensures successful onboarding milestones.',
      type: 'onboarding',
      status: 'active',
      competitor_ids: [],
      schedule: 'daily',
      success_rate: 0.95,
      total_insights: 12,
      insights_this_week: 3,
      last_run: '2024-01-15T11:00:00Z',
      next_run: '2024-01-16T11:00:00Z',
      configuration: {
        keywords: ['onboarding', 'setup', 'training'],
        sources: ['email', 'phone'],
        frequency: 'daily',
        notification_threshold: 0.90,
        data_retention_days: 90
      },
      created_date: '2024-01-08',
      performance_trend: 'up',
      assigned_accounts: []
    },
    {
      id: 'agent-expansion-001',
      name: 'Expansion Agent',
      description: 'Identifies and pursues expansion opportunities with existing customers for revenue growth.',
      type: 'expansion',
      status: 'paused',
      competitor_ids: [],
      schedule: 'weekly',
      success_rate: 0.85,
      total_insights: 8,
      insights_this_week: 0,
      last_run: '2024-01-08T12:00:00Z',
      next_run: '2024-01-22T12:00:00Z',
      configuration: {
        keywords: ['expansion', 'upsell', 'growth'],
        sources: ['email', 'linkedin'],
        frequency: 'weekly',
        notification_threshold: 0.75,
        data_retention_days: 120
      },
      created_date: '2024-01-03',
      performance_trend: 'stable',
      assigned_accounts: []
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setAgents(mockAgents);
      setLoading(false);
    }, 1000);
  }, []);

  // Simulate real-time agent activity updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAgentActivities(prev => {
        const updates = { ...prev };
        
        agents.forEach(agent => {
          const activityKey = agent.id;
          const lastActivity = updates[activityKey] || {
            status: agent.status,
            current_task: 'Monitoring data sources',
            last_execution: Date.now() - Math.random() * 1800000, // Random time within last 30 minutes
            progress: Math.floor(Math.random() * 100),
            insights_processed: Math.floor(Math.random() * 10),
            response_time: Math.floor(Math.random() * 500) + 100, // 100-600ms
            error_count: Math.floor(Math.random() * 3)
          };
          
          // Simulate status changes for active agents
          if (agent.status === 'active' && Math.random() < 0.05) { // 5% chance
            const tasks = [
              'Monitoring data sources',
              'Processing new insights',
              'Analyzing competitive data',
              'Generating reports',
              'Scanning for updates',
              'Evaluating trends'
            ];
            lastActivity.current_task = tasks[Math.floor(Math.random() * tasks.length)];
          }
          
          // Update progress for active agents
          if (agent.status === 'active' && Math.random() < 0.3) {
            lastActivity.progress = Math.min(100, lastActivity.progress + Math.floor(Math.random() * 15));
            if (lastActivity.progress >= 100) {
              lastActivity.progress = 0;
              lastActivity.insights_processed += Math.floor(Math.random() * 3) + 1;
            }
          }
          
          // Update response times
          if (Math.random() < 0.2) {
            lastActivity.response_time = Math.floor(Math.random() * 500) + 100;
          }
          
          // Simulate occasional errors
          if (Math.random() < 0.02) {
            lastActivity.error_count += 1;
          }
          
          updates[activityKey] = lastActivity;
        });
        
        return updates;
      });
      setLastActivityUpdate(Date.now());
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [agents]);

  // Generate Agent Performance Summary data
  const generatePerformanceSummary = (agents: IntelligenceAgent[]) => {
    return agents.map(agent => ({
      'Agent Name': agent.name,
      'Type': agent.type.toUpperCase(),
      'Status': agent.status.toUpperCase(),
      'Success Rate': `${Math.round(agent.success_rate * 100)}%`,
      'Total Insights': agent.total_insights,
      'Insights This Week': agent.insights_this_week,
      'Performance Trend': agent.performance_trend.toUpperCase(),
      'Schedule': agent.schedule,
      'Monitoring Competitors': agent.competitor_ids.length,
      'Created Date': new Date(agent.created_date).toLocaleDateString(),
      'Last Run': new Date(agent.last_run).toLocaleDateString(),
      'Next Run': new Date(agent.next_run).toLocaleDateString()
    }));
  };

  // Generate Detailed Agent Configuration data
  const generateDetailedConfiguration = (agents: IntelligenceAgent[]) => {
    return agents.map(agent => ({
      'Agent Name': agent.name,
      'Description': agent.description,
      'Type': agent.type.toUpperCase(),
      'Status': agent.status.toUpperCase(),
      'Schedule': agent.schedule,
      'Success Rate': agent.success_rate,
      'Total Insights': agent.total_insights,
      'Insights This Week': agent.insights_this_week,
      'Performance Trend': agent.performance_trend.toUpperCase(),
      'Monitored Competitors': agent.competitor_ids.join('; '),
      'Keywords': agent.configuration.keywords.join('; '),
      'Data Sources': agent.configuration.sources.join('; '),
      'Frequency': agent.configuration.frequency,
      'Notification Threshold': `${Math.round(agent.configuration.notification_threshold * 100)}%`,
      'Data Retention Days': agent.configuration.data_retention_days,
      'Created Date': agent.created_date,
      'Last Run': agent.last_run,
      'Next Run': agent.next_run
    }));
  };

  // Generate Agent Activity Report data
  const generateActivityReport = (agents: IntelligenceAgent[]) => {
    return agents.map(agent => ({
      'Agent Name': agent.name,
      'Type': agent.type.toUpperCase(),
      'Current Status': agent.status.toUpperCase(),
      'Schedule Frequency': agent.schedule,
      'Last Successful Run': new Date(agent.last_run).toLocaleString(),
      'Next Scheduled Run': new Date(agent.next_run).toLocaleString(),
      'Insights Generated': agent.total_insights,
      'Recent Activity (7 days)': agent.insights_this_week,
      'Average Daily Insights': Math.round(agent.total_insights / 30), // Approximate monthly average
      'Uptime Status': agent.status === 'active' ? '100%' : agent.status === 'paused' ? '0%' : 'ERROR',
      'Performance Trend': agent.performance_trend.toUpperCase(),
      'Configuration Last Updated': agent.created_date
    }));
  };

  // Generate Performance Analytics data
  const generatePerformanceAnalytics = (agents: IntelligenceAgent[]) => {
    const analytics = agents.map(agent => {
      const insightEfficiency = agent.total_insights / Math.max(1, Math.floor((new Date().getTime() - new Date(agent.created_date).getTime()) / (1000 * 60 * 60 * 24)));
      const weeklyGrowthRate = agent.insights_this_week > 0 ? ((agent.insights_this_week / (agent.total_insights - agent.insights_this_week)) * 100) : 0;
      
      return {
        'Agent Name': agent.name,
        'Type Category': agent.type.toUpperCase(),
        'Success Rate': `${Math.round(agent.success_rate * 100)}%`,
        'Insight Generation Rate': `${insightEfficiency.toFixed(2)} per day`,
        'Weekly Growth': `${weeklyGrowthRate.toFixed(1)}%`,
        'Total Insights': agent.total_insights,
        'Recent Performance': agent.insights_this_week,
        'Efficiency Score': Math.round(agent.success_rate * insightEfficiency * 10),
        'Competitor Coverage': agent.competitor_ids.length,
        'Data Source Count': agent.configuration.sources.length,
        'Keyword Diversity': agent.configuration.keywords.length,
        'Performance Trend': agent.performance_trend.toUpperCase(),
        'ROI Indicator': agent.success_rate > 0.8 && agent.insights_this_week > 5 ? 'HIGH' : agent.success_rate > 0.6 ? 'MEDIUM' : 'LOW'
      };
    });
    
    return analytics.sort((a, b) => parseInt(String(b['Efficiency Score'])) - parseInt(String(a['Efficiency Score'])));
  };

  // Generate Agent Health & Monitoring data
  const generateHealthMonitoring = (agents: IntelligenceAgent[]) => {
    return agents.map(agent => {
      const daysSinceLastRun = Math.floor((new Date().getTime() - new Date(agent.last_run).getTime()) / (1000 * 60 * 60 * 24));
      const healthScore = agent.status === 'active' && agent.success_rate > 0.7 ? 'HEALTHY' : 
                         agent.status === 'paused' ? 'PAUSED' : 
                         agent.status === 'error' ? 'CRITICAL' : 'WARNING';
      
      return {
        'Agent Name': agent.name,
        'Current Status': agent.status.toUpperCase(),
        'Health Score': healthScore,
        'Success Rate': `${Math.round(agent.success_rate * 100)}%`,
        'Days Since Last Run': daysSinceLastRun,
        'Error Rate': `${Math.round((1 - agent.success_rate) * 100)}%`,
        'Performance Trend': agent.performance_trend.toUpperCase(),
        'Configuration Issues': agent.configuration.keywords.length === 0 ? 'No Keywords' : 'OK',
        'Data Source Status': agent.configuration.sources.length > 0 ? 'CONFIGURED' : 'MISSING',
        'Notification Threshold': `${Math.round(agent.configuration.notification_threshold * 100)}%`,
        'Data Retention': `${agent.configuration.data_retention_days} days`,
        'Monitoring Scope': `${agent.competitor_ids.length} competitors`,
        'Last Successful Run': new Date(agent.last_run).toLocaleDateString(),
        'System Recommendation': healthScore === 'CRITICAL' ? 'IMMEDIATE ATTENTION' : 
                               healthScore === 'WARNING' ? 'REVIEW REQUIRED' : 'OPERATING NORMALLY'
      };
    });
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
  const handleExportCSV = (dataType: 'performance' | 'configuration' | 'activity' | 'analytics' | 'health') => {
    const timestamp = new Date().toISOString().split('T')[0];
    let data: any[] = [];
    let filename = '';

    switch (dataType) {
      case 'performance':
        data = generatePerformanceSummary(filteredAgents);
        filename = `agent-performance-summary-${timestamp}.csv`;
        break;
      case 'configuration':
        data = generateDetailedConfiguration(filteredAgents);
        filename = `agent-detailed-configuration-${timestamp}.csv`;
        break;
      case 'activity':
        data = generateActivityReport(filteredAgents);
        filename = `agent-activity-report-${timestamp}.csv`;
        break;
      case 'analytics':
        data = generatePerformanceAnalytics(filteredAgents);
        filename = `agent-performance-analytics-${timestamp}.csv`;
        break;
      case 'health':
        data = generateHealthMonitoring(filteredAgents);
        filename = `agent-health-monitoring-${timestamp}.csv`;
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
      total_agents: filteredAgents.length,
      performance_summary: generatePerformanceSummary(filteredAgents),
      detailed_configuration: generateDetailedConfiguration(filteredAgents),
      activity_report: generateActivityReport(filteredAgents),
      performance_analytics: generatePerformanceAnalytics(filteredAgents),
      health_monitoring: generateHealthMonitoring(filteredAgents)
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, `agent-intelligence-${timestamp}.json`, 'application/json');
    setShowExportMenu(false);
  };

  const handleExportAll = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Export all as separate CSV files
    handleExportCSV('performance');
    setTimeout(() => handleExportCSV('configuration'), 100);
    setTimeout(() => handleExportCSV('activity'), 200);
    setTimeout(() => handleExportCSV('analytics'), 300);
    setTimeout(() => handleExportCSV('health'), 400);
    
    setShowExportMenu(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pricing': return DollarSign;
      case 'features': return Package;
      case 'news': return Globe;
      case 'hiring': return Users;
      case 'social': return MessageSquare;
      case 'funding': return TrendingUp;
      case 'products': return Zap;
      // Customer Account Agent Types
      case 'renewal': return Target;
      case 'health': return Activity;
      case 'onboarding': return CheckCircle;
      case 'expansion': return TrendingUp;
      default: return Bot;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pricing': return { bg: '#f0fdf4', color: '#10b981' };
      case 'features': return { bg: '#f0f4ff', color: '#4285f4' };
      case 'news': return { bg: '#fef3c7', color: '#f59e0b' };
      case 'hiring': return { bg: '#e9d5ff', color: '#8b5cf6' };
      case 'social': return { bg: '#fce7f3', color: '#ec4899' };
      case 'funding': return { bg: '#ecfccb', color: '#65a30d' };
      case 'products': return { bg: '#fef2e2', color: '#ea580c' };
      // Customer Account Agent Colors
      case 'renewal': return { bg: '#dbeafe', color: '#3b82f6' };
      case 'health': return { bg: '#fee2e2', color: '#ef4444' };
      case 'onboarding': return { bg: '#d1fae5', color: '#10b981' };
      case 'expansion': return { bg: '#fef3c7', color: '#f59e0b' };
      default: return { bg: '#f1f5f9', color: '#6b7280' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'calendly-badge-success';
      case 'paused': return 'calendly-badge-warning';
      case 'error': return 'calendly-badge-danger';
      case 'stopped': return 'calendly-badge-info';
      default: return 'calendly-badge-info';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return Play;
      case 'paused': return Pause;
      case 'error': return AlertTriangle;
      case 'stopped': return StopCircle;
      default: return Clock;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return () => <TrendingUp className="rotate-180" />;
      case 'stable': return () => <div className="w-4 h-4 border-t-2 border-gray-400"></div>;
      default: return BarChart3;
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = !searchQuery || 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || agent.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAgentAction = (agentId: string, action: 'start' | 'pause' | 'stop' | 'edit') => {
    // Simulate agent action
    console.log(`${action} agent ${agentId}`);
  };

  const handleAgentClick = (agentId: string) => {
    router.push(`/agents/${agentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#4285f4' }}></div>
                <p className="calendly-body mt-4">Loading agents...</p>
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
              <h1 className="calendly-h1">AI Agents</h1>
              <p className="calendly-body">Manage and monitor intelligent agents for competitive intelligence</p>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Export Agent Intelligence</h3>
                      
                      {/* CSV Exports */}
                      <div className="space-y-2 mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">CSV Reports</h4>
                        <button
                          onClick={() => handleExportCSV('performance')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">Performance Summary</div>
                            <div className="text-xs text-gray-500">Success rates & insight metrics</div>
                          </div>
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportCSV('configuration')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">Detailed Configuration</div>
                            <div className="text-xs text-gray-500">Complete agent setup & settings</div>
                          </div>
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportCSV('activity')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">Activity Report</div>
                            <div className="text-xs text-gray-500">Scheduling & operational insights</div>
                          </div>
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportCSV('analytics')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">Performance Analytics</div>
                            <div className="text-xs text-gray-500">Data-driven optimization insights</div>
                          </div>
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportCSV('health')}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium">Health & Monitoring</div>
                            <div className="text-xs text-gray-500">System reliability & error tracking</div>
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
                            <div className="text-xs text-indigo-600">Download all 5 CSV reports</div>
                          </div>
                          <Package className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                        Exporting {filteredAgents.length} agents
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
                onClick={() => router.push('/agents/create')}
                className="calendly-btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Agent</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Total Agents</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{agents.length}</p>
                </div>
                <Bot className="w-8 h-8" style={{ color: '#4285f4' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Active Agents</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{agents.filter(a => a.status === 'active').length}</p>
                </div>
                <Play className="w-8 h-8" style={{ color: '#10b981' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Total Insights</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{agents.reduce((sum, a) => sum + a.total_insights, 0).toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8" style={{ color: '#4285f4' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Avg Success Rate</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{Math.round(agents.reduce((sum, a) => sum + a.success_rate, 0) / agents.length * 100)}%</p>
                </div>
                <Target className="w-8 h-8" style={{ color: '#10b981' }} />
              </div>
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
                    placeholder="Search agents by name, type, or description..."
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
                  <Bot className="w-4 h-4" style={{ color: '#718096' }} />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                    style={{ border: '1px solid #e2e8f0', background: 'white' }}
                  >
                    <option value="all">All Types</option>
                    <option value="pricing">Pricing</option>
                    <option value="features">Features</option>
                    <option value="news">News</option>
                    <option value="hiring">Hiring</option>
                    <option value="social">Social</option>
                    <option value="funding">Funding</option>
                    <option value="products">Products</option>
                    <option value="renewal">Renewal</option>
                    <option value="health">Health</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="expansion">Expansion</option>
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
                    <option value="paused">Paused</option>
                    <option value="error">Error</option>
                    <option value="stopped">Stopped</option>
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

          {/* Agents Display */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => {
                const TypeIcon = getTypeIcon(agent.type);
                const StatusIcon = getStatusIcon(agent.status);
                const typeColors = getTypeColor(agent.type);
                const TrendIcon = getTrendIcon(agent.performance_trend);
                
                return (
                  <div
                    key={agent.id}
                    onClick={() => handleAgentClick(agent.id)}
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
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: typeColors.bg }}>
                          <TypeIcon className="w-6 h-6" style={{ color: typeColors.color }} />
                        </div>
                        <div>
                          <h3 className="calendly-h3" style={{ marginBottom: '2px' }}>{agent.name}</h3>
                          <p className="calendly-label-sm">{agent.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className={`calendly-badge ${getStatusColor(agent.status)} flex items-center space-x-1`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{agent.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="calendly-body-sm line-clamp-2" style={{ marginBottom: '16px' }}>
                      {agent.description}
                    </p>

                    {/* Real-time Activity Status */}
                    {agent.status === 'active' && (
                      <div className="bg-gray-50 rounded-lg p-3" style={{ marginBottom: '12px' }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-medium text-gray-700">Live Activity</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {agentActivities[agent.id]?.response_time || 250}ms
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {agentActivities[agent.id]?.current_task || 'Monitoring data sources'}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${agentActivities[agent.id]?.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {agentActivities[agent.id]?.progress || 0}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '16px' }}>
                      <div className="text-center">
                        <p className="calendly-h3" style={{ marginBottom: '2px' }}>
                          {agent.assigned_accounts?.length || agent.total_insights}
                        </p>
                        <p className="calendly-label-sm">
                          {agent.assigned_accounts ? 'Accounts' : 'Insights'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="calendly-h3" style={{ marginBottom: '2px' }}>{Math.round(agent.success_rate * 100)}%</p>
                        <p className="calendly-label-sm">Success</p>
                      </div>
                      <div className="text-center">
                        <p className="calendly-h3" style={{ marginBottom: '2px' }}>
                          {agent.assigned_accounts ? 
                            agent.assigned_accounts.filter(a => a.status === 'active').length :
                            (agent.insights_this_week + (agentActivities[agent.id]?.insights_processed || 0))
                          }
                        </p>
                        <p className="calendly-label-sm">
                          {agent.assigned_accounts ? 'Active' : 'This Week'}
                        </p>
                      </div>
                    </div>

                    {/* Customer Assignments for Account Agents */}
                    {agent.assigned_accounts && agent.assigned_accounts.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Accounts</h4>
                        <div className="space-y-2">
                          {agent.assigned_accounts.slice(0, 2).map((account) => (
                            <div key={account.account_id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                              <div>
                                <div className="font-medium">{account.company_name}</div>
                                <div className="text-gray-500">{account.purpose}</div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <div className={`w-2 h-2 rounded-full ${
                                  account.status === 'active' ? 'bg-green-500 animate-pulse' :
                                  account.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
                                }`}></div>
                                <span className="text-gray-600">
                                  Next: {new Date(account.next_contact).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                          {agent.assigned_accounts.length > 2 && (
                            <div className="text-xs text-gray-500 text-center py-1">
                              +{agent.assigned_accounts.length - 2} more accounts
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Performance Metrics for Active Agents */}
                    {agent.status === 'active' && (
                      <div className="grid grid-cols-2 gap-2 text-xs" style={{ marginBottom: '12px' }}>
                        <div className="bg-blue-50 p-2 rounded text-center">
                          <div className="font-medium text-blue-700">
                            {agentActivities[agent.id]?.insights_processed || 0}
                          </div>
                          <div className="text-blue-600">Processed Today</div>
                        </div>
                        <div className="bg-red-50 p-2 rounded text-center">
                          <div className="font-medium text-red-700">
                            {agentActivities[agent.id]?.error_count || 0}
                          </div>
                          <div className="text-red-600">Errors</div>
                        </div>
                      </div>
                    )}

                    {/* Footer with trend and actions */}
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                      <div className="flex items-center space-x-2">
                        <TrendIcon className="w-4 h-4" style={{ 
                          color: agent.performance_trend === 'up' ? '#10b981' : 
                                 agent.performance_trend === 'down' ? '#ef4444' : '#718096' 
                        }} />
                        <span className="calendly-label-sm">{agent.schedule}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAgentAction(agent.id, 'edit');
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
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAgentAction(agent.id, agent.status === 'active' ? 'pause' : 'start');
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
                          {agent.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="calendly-card" style={{ padding: 0 }}>
              <div className="overflow-x-auto">
                <table className="calendly-table">
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Schedule</th>
                      <th>Success Rate</th>
                      <th>Insights</th>
                      <th>This Week</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgents.map((agent) => {
                      const TypeIcon = getTypeIcon(agent.type);
                      const StatusIcon = getStatusIcon(agent.status);
                      const typeColors = getTypeColor(agent.type);
                      
                      return (
                        <tr key={agent.id} className="cursor-pointer" onClick={() => handleAgentClick(agent.id)}>
                          <td>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: typeColors.bg }}>
                                <TypeIcon className="w-4 h-4" style={{ color: typeColors.color }} />
                              </div>
                              <span className="font-medium">{agent.name}</span>
                            </div>
                          </td>
                          <td>{agent.type.replace('_', ' ')}</td>
                          <td>
                            <span className={`calendly-badge ${getStatusColor(agent.status)} flex items-center space-x-1`}>
                              <StatusIcon className="w-3 h-3" />
                              <span>{agent.status}</span>
                            </span>
                          </td>
                          <td>{agent.schedule}</td>
                          <td>
                            <div className="flex items-center space-x-2">
                              <span>{Math.round(agent.success_rate * 100)}%</span>
                              {agent.status === 'active' && (
                                <span className="text-xs text-gray-500">
                                  {agentActivities[agent.id]?.response_time || 250}ms
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            {agent.assigned_accounts ? 
                              `${agent.assigned_accounts.length} accounts` :
                              agent.total_insights
                            }
                          </td>
                          <td>
                            <div className="flex items-center space-x-2">
                              <span>
                                {agent.assigned_accounts ? 
                                  `${agent.assigned_accounts.filter(a => a.status === 'active').length} active` :
                                  (agent.insights_this_week + (agentActivities[agent.id]?.insights_processed || 0))
                                }
                              </span>
                              {agent.status === 'active' && (
                                <div className="w-12 bg-gray-200 rounded-full h-1">
                                  <div 
                                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                    style={{ width: `${agentActivities[agent.id]?.progress || 0}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAgentAction(agent.id, 'edit');
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
                                <Settings className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAgentAction(agent.id, agent.status === 'active' ? 'pause' : 'start');
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
                                {agent.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredAgents.length === 0 && (
            <div className="calendly-card text-center py-12">
              <Bot className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
              <h3 className="calendly-h3" style={{ marginBottom: '8px' }}>No agents found</h3>
              <p className="calendly-body" style={{ marginBottom: '24px' }}>
                {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating your first AI agent'}
              </p>
              <button 
                onClick={() => router.push('/agents/create')}
                className="calendly-btn-primary"
              >
                Create Agent
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}