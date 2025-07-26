'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
 ArrowLeft,
 Bot,
 Activity,
 Clock,
 Target,
 TrendingUp,
 AlertTriangle,
 CheckCircle,
 XCircle,
 Zap,
 Globe,
 DollarSign,
 Users,
 Briefcase,
 Calendar,
 BarChart3,
 Settings,
 Play,
 Pause,
 RefreshCw,
 Eye,
 Building2,
 Lightbulb,
 AlertCircle,
 Info,
 ExternalLink,
 Download,
 X
} from 'lucide-react';

interface AgentInsight {
 id: string;
 title: string;
 description: string;
 type: 'pricing' | 'product' | 'marketing' | 'hiring' | 'competitive';
 impact: 'high' | 'medium' | 'low';
 timestamp: string;
 confidence: number;
 source: string;
 linkedCompetitors: string[];
 actionItems?: string[];
}

interface LinkedCompetitor {
 id: string;
 name: string;
 logo: string;
 relationship: 'primary' | 'secondary';
 lastUpdate: string;
 insightsCount: number;
}

interface AgentProfile {
 id: string;
 name: string;
 type: 'pricing' | 'product' | 'marketing' | 'hiring' | 'social' | 'news';
 status: 'active' | 'paused' | 'error';
 description: string;
 frequency: string;
 lastRun: string;
 nextRun: string;
 created: string;
 totalInsights: number;
 monthlyInsights: number;
 weeklyInsights: number;
 successRate: number;
 avgConfidence: number;
 linkedCompetitors: LinkedCompetitor[];
 recentInsights: AgentInsight[];
 performance: {
  uptime: number;
  avgRunTime: number;
  totalRuns: number;
  successfulRuns: number;
 };
}

export default function AgentProfilePage() {
 const router = useRouter();
 const params = useParams();
 const agentId = params?.id as string;
 
 const [agent, setAgent] = useState<AgentProfile | null>(null);
 const [loading, setLoading] = useState(true);
 const [activeSection, setActiveSection] = useState('overview');
 const [insightFilter, setInsightFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
 const [navigationSource, setNavigationSource] = useState<'dashboard' | 'competitor' | 'agents'>('dashboard');
 
 // CSV export states
 const [csvDateRange, setCsvDateRange] = useState({
  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  end: new Date()
 });
 const [showDatePicker, setShowDatePicker] = useState(false);

 useEffect(() => {
  fetchAgentProfile();
  
  // Detect navigation source based on referrer
  const detectNavigationSource = () => {
   if (typeof window !== 'undefined') {
    const referrer = document.referrer;
    if (referrer.includes('/competitors/')) {
     setNavigationSource('competitor');
    } else if (referrer.includes('/competitor-intelligence/agents')) {
     setNavigationSource('agents');
    } else {
     setNavigationSource('dashboard');
    }
   }
  };
  
  detectNavigationSource();
 }, [agentId]);

 const fetchAgentProfile = async () => {
  try {
   setLoading(true);
   
   // Mock data for now - replace with API call
   const mockAgent: AgentProfile = {
    id: agentId,
    name: agentId === 'sf-pricing-agent' ? 'Salesforce Pricing Monitor' 
       : agentId === 'hs-product-agent' ? 'HubSpot Product Intelligence'
       : agentId === 'pd-product-agent' ? 'Pipedrive Feature Tracker'
       : 'Market Intelligence Agent',
    type: agentId?.includes('pricing') ? 'pricing'
       : agentId?.includes('product') ? 'product'
       : agentId?.includes('marketing') ? 'marketing'
       : agentId?.includes('hiring') ? 'hiring'
       : 'product',
    status: agentId?.includes('error') ? 'error' : 'active',
    description: agentId === 'sf-pricing-agent' 
     ? 'Monitors Salesforce pricing changes, new tiers, and promotional offers across all products with real-time alerts and competitive analysis.'
     : agentId === 'hs-product-agent'
     ? 'Tracks HubSpot product updates, new AI features, and integration releases with impact assessment and competitive positioning.'
     : agentId === 'pd-product-agent'
     ? 'Monitors Pipedrive feature releases, mobile updates, and platform improvements with SMB market focus.'
     : 'Advanced AI agent for comprehensive market intelligence and competitive monitoring.',
    frequency: 'Every 4 hours',
    lastRun: '2024-01-15T14:30:00Z',
    nextRun: '2024-01-15T18:30:00Z',
    created: '2024-01-01T00:00:00Z',
    totalInsights: 247,
    monthlyInsights: 89,
    weeklyInsights: 23,
    successRate: 94.2,
    avgConfidence: 87.5,
    linkedCompetitors: [
     {
      id: '1',
      name: 'Salesforce',
      logo: '/logos/salesforce.png',
      relationship: 'primary',
      lastUpdate: '2024-01-15T14:30:00Z',
      insightsCount: 156
     },
     {
      id: '2',
      name: 'HubSpot',
      logo: '/logos/hubspot.png',
      relationship: 'secondary',
      lastUpdate: '2024-01-15T12:00:00Z',
      insightsCount: 91
     }
    ],
    recentInsights: [
     {
      id: 'insight-1',
      title: 'Salesforce Einstein Pricing Tier Restructure',
      description: 'Major pricing restructure detected with 15% increase in Enterprise tier, new Einstein AI features bundled, affecting 60% of enterprise customers.',
      type: 'pricing',
      impact: 'high',
      timestamp: '2024-01-15T14:30:00Z',
      confidence: 94,
      source: 'Salesforce Pricing Page',
      linkedCompetitors: ['1'],
      actionItems: [
       'Review our enterprise pricing strategy against new Salesforce rates',
       'Analyze customer price sensitivity in affected segments',
       'Prepare competitive positioning materials for sales team'
      ]
     },
     {
      id: 'insight-2', 
      title: 'HubSpot AI Content Assistant Launch',
      description: 'New AI-powered content generation tool launched for marketing teams, directly competing with our content intelligence features.',
      type: 'product',
      impact: 'high',
      timestamp: '2024-01-15T12:15:00Z',
      confidence: 91,
      source: 'HubSpot Product Blog',
      linkedCompetitors: ['2'],
      actionItems: [
       'Benchmark AI content quality against our platform',
       'Evaluate customer churn risk in content marketing segment',
       'Fast-track our content AI roadmap timeline'
      ]
     },
     {
      id: 'insight-3',
      title: 'Pipedrive Mobile App Performance Improvements',
      description: '40% faster load times and new offline functionality targeting sales teams, enhancing competitive position in mobile-first SMB segment.',
      type: 'product',
      impact: 'medium',
      timestamp: '2024-01-15T10:45:00Z',
      confidence: 78,
      source: 'App Store Release Notes',
      linkedCompetitors: ['3']
     }
    ],
    performance: {
     uptime: 99.2,
     avgRunTime: 3.4,
     totalRuns: 1847,
     successfulRuns: 1740
    }
   };

   setAgent(mockAgent);
  } catch (error) {
   console.error('Error fetching agent profile:', error);
  } finally {
   setLoading(false);
  }
 };

 const exportInsightsToCSV = () => {
  if (!agent?.recentInsights) return;

  // Filter insights by date range
  const filteredInsights = agent.recentInsights.filter(insight => {
   const insightDate = new Date(insight.timestamp);
   return insightDate >= csvDateRange.start && insightDate <= csvDateRange.end;
  });

  // Create CSV headers
  const headers = [
   'Date',
   'Title',
   'Type',
   'Impact',
   'Confidence',
   'Description',
   'Source',
   'Linked Competitors',
   'Action Items'
  ];

  // Convert insights to CSV rows
  const csvRows = filteredInsights.map(insight => [
   new Date(insight.timestamp).toLocaleDateString(),
   `"${insight.title.replace(/"/g, '""')}"`,
   insight.type,
   insight.impact,
   `${insight.confidence}%`,
   `"${insight.description.replace(/"/g, '""')}"`,
   insight.source,
   insight.linkedCompetitors.join('; '),
   insight.actionItems ? `"${insight.actionItems.join('; ').replace(/"/g, '""')}"` : ''
  ]);

  // Combine headers and rows
  const csvContent = [
   headers.join(','),
   ...csvRows.map(row => row.join(','))
  ].join('\n');

  // Create and download CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${agent.name.toLowerCase().replace(/\s+/g, '-')}-insights-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  setShowDatePicker(false);
 };

 const getStatusColor = (status: string) => {
  switch (status) {
   case 'active': return 'bg-green-100 text-green-800 border-green-200';
   case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
   case 'error': return 'bg-red-100 text-red-800 border-red-200';
   default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
 };

 const getTypeIcon = (type: string) => {
  switch (type) {
   case 'pricing': return DollarSign;
   case 'product': return Zap;
   case 'marketing': return Target;
   case 'hiring': return Users;
   case 'social': return Globe;
   case 'news': return Activity;
   default: return Bot;
  }
 };

 const getImpactColor = (impact: string) => {
  switch (impact) {
   case 'high': return 'bg-red-100 text-red-800';
   case 'medium': return 'bg-yellow-100 text-yellow-800';
   case 'low': return 'bg-green-100 text-green-800';
   default: return 'bg-gray-100 text-gray-800';
  }
 };

 const getInsightIcon = (type: string) => {
  switch (type) {
   case 'pricing': return DollarSign;
   case 'product': return Zap;
   case 'marketing': return Target;
   case 'hiring': return Users;
   case 'competitive': return Activity;
   default: return Lightbulb;
  }
 };

 const filteredInsights = agent?.recentInsights.filter(insight => 
  insightFilter === 'all' || insight.impact === insightFilter
 ) || [];

 if (loading) {
  return (
   <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
    <div className="p-6">
     <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-center min-h-96">
       <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#4285f4' }}></div>
        <p className="calendly-body mt-4">Loading agent profile...</p>
       </div>
      </div>
     </div>
    </div>
   </div>
  );
 }

 if (!agent) {
  return (
   <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
    <div className="p-6">
     <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-center min-h-96">
       <div className="text-center">
        <Bot className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
        <h1 className="calendly-h1" style={{ marginBottom: '8px' }}>Agent Not Found</h1>
        <p className="calendly-body" style={{ marginBottom: '24px' }}>The requested agent profile could not be loaded.</p>
        <button
         onClick={() => router.push('/agents')}
         className="calendly-btn-primary"
        >
         Back to Agents
        </button>
       </div>
      </div>
     </div>
    </div>
   </div>
  );
 }

 const TypeIcon = getTypeIcon(agent.type);

 return (
  <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
   {/* Navigation */}
   <div className="calendly-card-static border-b" style={{ margin: '0 24px 24px 24px', padding: '16px 24px', borderRadius: '0' }}>
    <div className="max-w-7xl mx-auto">
     <div className="flex items-center space-x-4">
      <button
       onClick={() => router.push('/agents')}
       className="p-2 rounded-lg "
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
       <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="flex items-center space-x-2">
       <button 
        onClick={() => router.push('/agents')}
        className="calendly-body-sm "
        style={{ color: '#718096' }}
        onMouseEnter={(e) => {
         e.currentTarget.style.color = '#4285f4';
        }}
        onMouseLeave={(e) => {
         e.currentTarget.style.color = '#718096';
        }}
       >
        Agents
       </button>
       {navigationSource === 'competitor' && (
        <>
         <span>›</span>
         <button 
          onClick={() => router.back()}
          className=""
         >
          Competitor Profile
         </button>
        </>
       )}
       {navigationSource === 'agents' && (
        <>
         <span>›</span>
         <button 
          onClick={() => router.push('/agents')}
          className=""
         >
          AI Agents
         </button>
        </>
       )}
       <span style={{ color: '#a0aec0' }}>›</span>
       <span className="calendly-body-sm font-medium" style={{ color: '#1a1a1a' }}>{agent.name}</span>
      </div>
     </div>
    </div>
   </div>

   <div className="p-6">
    <div className="max-w-7xl mx-auto">

     {/* Agent Header */}
     <div className="calendly-card" style={{ padding: '32px', marginBottom: '24px' }}>
     <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-6">
      <div className="flex items-center justify-center sm:justify-start">
       <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: '#4285f4' }}>
        <TypeIcon className="w-8 h-8 text-white" />
       </div>
      </div>
      <div className="flex-1 text-center sm:text-left">
       <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{agent.name}</h1>
       <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
        <span className="text-gray-800 text-base font-medium">{agent.type.charAt(0).toUpperCase() + agent.type.slice(1)} Agent</span>
        <span className="text-gray-400">•</span>
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(agent.status)}`}>
         {agent.status.toUpperCase()}
        </span>
       </div>
       <p className="text-gray-700 leading-relaxed">
        {agent.description}
       </p>
       <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
         <Clock className="w-4 h-4" />
         <span>Runs {agent.frequency}</span>
        </div>
        <div className="flex items-center space-x-1">
         <Calendar className="w-4 h-4" />
         <span>Active since {new Date(agent.created).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-1">
         <BarChart3 className="w-4 h-4" />
         <span>{agent.totalInsights} total insights</span>
        </div>
       </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
       <button 
        onClick={() => router.push(`/agents/${agentId}/edit`)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
       >
        <Settings className="w-4 h-4" />
        <span>Configure</span>
       </button>
       <button 
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
         agent.status === 'active' 
          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
          : 'bg-green-100 text-green-800 border border-green-200'
        }`}
       >
        {agent.status === 'active' ? (
         <>
          <Pause className="w-4 h-4" />
          <span>Pause Agent</span>
         </>
        ) : (
         <>
          <Play className="w-4 h-4" />
          <span>Resume Agent</span>
         </>
        )}
       </button>
       <button className="calendly-btn-primary flex items-center space-x-2">
        <RefreshCw className="w-4 h-4" />
        <span>Run Now</span>
       </button>
      </div>
     </div>
    </div>

    {/* Main Content */}
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
     {/* Main Content Area */}
     <div className="lg:col-span-3 space-y-6">
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
       <div className="calendly-card">
        <div className="flex items-center justify-between">
         <div>
          <p className="text-sm text-gray-600">Success Rate</p>
          <p className="text-2xl font-bold text-green-600">{agent.successRate}%</p>
         </div>
         <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
       </div>
       <div className="calendly-card">
        <div className="flex items-center justify-between">
         <div>
          <p className="text-sm text-gray-600">Avg Confidence</p>
          <p className="text-2xl font-bold text-blue-600">{agent.avgConfidence}%</p>
         </div>
         <Target className="w-8 h-8 text-blue-500" />
        </div>
       </div>
       <div className="calendly-card">
        <div className="flex items-center justify-between">
         <div>
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-2xl font-bold text-purple-600">{agent.monthlyInsights}</p>
         </div>
         <TrendingUp className="w-8 h-8 text-purple-500" />
        </div>
       </div>
       <div className="calendly-card">
        <div className="flex items-center justify-between">
         <div>
          <p className="text-sm text-gray-600">Uptime</p>
          <p className="text-2xl font-bold text-blue-600">{agent.performance.uptime}%</p>
         </div>
         <Activity className="w-8 h-8 text-indigo-500" />
        </div>
       </div>
      </div>

      {/* Generated Insights */}
      <div className="calendly-card p-6">
       <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
         <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-blue-600" />
         </div>
         <div>
          <h2 className="text-xl font-bold text-gray-900">Generated Insights</h2>
          <p className="text-sm text-gray-600">AI-powered competitive intelligence</p>
         </div>
        </div>
        <div className="flex items-center space-x-3">
         <select
          value={insightFilter}
          onChange={(e) => setInsightFilter(e.target.value as any)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 bg-white"
         >
          <option value="all">All Impact Levels</option>
          <option value="high">High Impact</option>
          <option value="medium">Medium Impact</option>
          <option value="low">Low Impact</option>
         </select>
         <div className="relative">
          <button
           onClick={() => setShowDatePicker(!showDatePicker)}
           className="calendly-btn-primary flex items-center space-x-2 text-sm font-medium"
          >
           <Download className="w-4 h-4" />
           <span>Export CSV</span>
          </button>
          
          {/* Date Picker Dropdown */}
          {showDatePicker && (
           <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-10 min-w-[320px]">
            <div className="mb-4">
             <h3 className="text-sm font-semibold text-gray-900 mb-2">Export Date Range</h3>
             <p className="text-xs text-gray-600 mb-3">Select the time period for your CSV export</p>
            </div>
            
            <div className="space-y-3">
             <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-700 w-12">From:</label>
              <input
               type="date"
               value={csvDateRange.start.toISOString().split('T')[0]}
               max={new Date().toISOString().split('T')[0]}
               onChange={(e) => setCsvDateRange(prev => ({
                ...prev,
                start: new Date(e.target.value)
               }))}
               className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
             </div>
             
             <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-700 w-12">To:</label>
              <input
               type="date"
               value={csvDateRange.end.toISOString().split('T')[0]}
               max={new Date().toISOString().split('T')[0]}
               onChange={(e) => setCsvDateRange(prev => ({
                ...prev,
                end: new Date(e.target.value)
               }))}
               className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
             </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
             <span className="text-xs text-gray-500">
              {agent?.recentInsights?.filter(insight => {
               const insightDate = new Date(insight.timestamp);
               return insightDate >= csvDateRange.start && insightDate <= csvDateRange.end;
              }).length || 0} insights in range
             </span>
             <div className="flex space-x-2">
              <button
               onClick={() => setShowDatePicker(false)}
               className="px-3 py-1 text-gray-600 rounded text-sm"
              >
               Cancel
              </button>
              <button
               onClick={exportInsightsToCSV}
               className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 text-white rounded text-sm "
              >
               <Download className="w-3 h-3" />
               <span>Download</span>
              </button>
             </div>
            </div>
           </div>
          )}
         </div>
        </div>
       </div>

       <div className="space-y-4">
        {filteredInsights.map((insight) => {
         const InsightIcon = getInsightIcon(insight.type);
         
         return (
          <div key={insight.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
           <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
             <div className="flex items-center space-x-3 mb-2">
              <InsightIcon className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-gray-900">{insight.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getImpactColor(insight.impact)}`}>
               {insight.impact.toUpperCase()}
              </span>
              <span className="px-2 py-1 text-xs rounded border bg-gray-50 text-gray-700">{insight.type}</span>
             </div>
             <p className="text-gray-700 mb-3">{insight.description}</p>
             
             <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
              <span className="flex items-center space-x-1">
               <Clock className="w-3 h-3" />
               <span>{new Date(insight.timestamp).toLocaleString()}</span>
              </span>
              <span className="flex items-center space-x-1">
               <Target className="w-3 h-3" />
               <span>{insight.confidence}% confidence</span>
              </span>
              <span className="flex items-center space-x-1">
               <ExternalLink className="w-3 h-3" />
               <a 
                href={`https://google.com/search?q=${encodeURIComponent(insight.source)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline "
               >
                {insight.source}
               </a>
              </span>
             </div>
             
             {insight.actionItems && insight.actionItems.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4">
               <h4 className="font-medium text-gray-900 mb-2">Recommended Actions</h4>
               <ul className="space-y-1">
                {insight.actionItems.map((action, index) => (
                 <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{action}</span>
                 </li>
                ))}
               </ul>
              </div>
             )}
            </div>
           </div>
          </div>
         );
        })}
       </div>
      </div>
     </div>

     {/* Sidebar */}
     <div className="space-y-6">
      {/* Linked Competitors */}
      <div className="calendly-card p-6">
       <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Building2 className="w-5 h-5 text-blue-600" />
        <span>Linked Competitors</span>
       </h3>
       <div className="space-y-3">
        {agent.linkedCompetitors.map((competitor) => (
         <button
          key={competitor.id}
          onClick={() => router.push(`/competitors/${competitor.id}`)}
          className="w-full bg-gray-50 rounded-lg p-4 text-left cursor-pointer"
         >
          <div className="flex items-center space-x-3 mb-2">
           <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-blue-600" />
           </div>
           <div className="flex-1">
            <h4 className="font-medium text-gray-900">{competitor.name}</h4>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
             <span className={`px-1.5 py-0.5 rounded-full ${
              competitor.relationship === 'primary' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
             }`}>
              {competitor.relationship}
             </span>
             <span>{competitor.insightsCount} insights</span>
            </div>
           </div>
          </div>
          <div className="flex items-center justify-between">
           <span className="text-xs text-gray-500">
            Updated {new Date(competitor.lastUpdate).toLocaleDateString()}
           </span>
           <span className="text-xs text-blue-600 font-medium">
            View Profile →
           </span>
          </div>
         </button>
        ))}
       </div>
      </div>

      {/* Performance Stats */}
      <div className="calendly-card p-6">
       <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Stats</h3>
       <div className="space-y-4">
        <div className="flex justify-between items-center">
         <span className="text-sm text-gray-600">Total Runs</span>
         <span className="font-semibold text-gray-900">{agent.performance.totalRuns.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
         <span className="text-sm text-gray-600">Successful Runs</span>
         <span className="font-semibold text-green-600">{agent.performance.successfulRuns.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
         <span className="text-sm text-gray-600">Avg Runtime</span>
         <span className="font-semibold text-gray-900">{agent.performance.avgRunTime}s</span>
        </div>
        <div className="flex justify-between items-center">
         <span className="text-sm text-gray-600">Last Run</span>
         <span className="font-semibold text-gray-900">
          {new Date(agent.lastRun).toLocaleString()}
         </span>
        </div>
        <div className="flex justify-between items-center">
         <span className="text-sm text-gray-600">Next Run</span>
         <span className="font-semibold text-blue-600">
          {new Date(agent.nextRun).toLocaleString()}
         </span>
        </div>
       </div>
      </div>
     </div>
     </div>
    </div>
   </div>
  </div>
 );
}