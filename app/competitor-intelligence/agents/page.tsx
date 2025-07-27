'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Search,
  Filter,
  Zap,
  Eye,
  Edit,
  Plus,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Pause
} from 'lucide-react';

interface IntelligenceAgent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'error';
  total_insights: number;
  competitor_ids: string[];
  last_run: string;
  created_at: string;
  triggers: string[];
  frequency: 'hourly' | 'daily' | 'weekly';
}

export default function AllAgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<IntelligenceAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'error'>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<'all' | 'hourly' | 'daily' | 'weekly'>('all');
  const [monitorFilter, setMonitorFilter] = useState<'all' | 'news' | 'social' | 'product' | 'pricing' | 'hiring'>('all');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      setAgents([
        {
          id: 'agent1',
          name: 'News & PR Monitor',
          description: 'Tracks competitor news, press releases, and media mentions across major publications',
          status: 'active',
          total_insights: 24,
          competitor_ids: ['1', '2', '3'],
          last_run: '2024-01-15T10:30:00Z',
          created_at: '2024-01-01T00:00:00Z',
          triggers: ['news', 'press-releases', 'media-mentions'],
          frequency: 'hourly'
        },
        {
          id: 'agent2',
          name: 'Product Launch Detector',
          description: 'Monitors competitor websites and social media for new product announcements and launches',
          status: 'active',
          total_insights: 18,
          competitor_ids: ['1', '2'],
          last_run: '2024-01-15T09:15:00Z',
          created_at: '2024-01-02T00:00:00Z',
          triggers: ['product-launches', 'website-changes'],
          frequency: 'daily'
        },
        {
          id: 'agent3',
          name: 'Pricing Intelligence',
          description: 'Tracks pricing changes and new pricing models across competitor platforms',
          status: 'paused',
          total_insights: 12,
          competitor_ids: ['1'],
          last_run: '2024-01-14T16:45:00Z',
          created_at: '2024-01-03T00:00:00Z',
          triggers: ['pricing-changes', 'new-plans'],
          frequency: 'daily'
        },
        {
          id: 'agent4',
          name: 'Social Media Tracker',
          description: 'Monitors competitor social media activity, engagement patterns, and campaign launches',
          status: 'active',
          total_insights: 31,
          competitor_ids: ['2', '3'],
          last_run: '2024-01-15T11:00:00Z',
          created_at: '2024-01-04T00:00:00Z',
          triggers: ['social-media', 'campaigns'],
          frequency: 'hourly'
        },
        {
          id: 'agent5',
          name: 'Job Posting Analyzer',
          description: 'Analyzes competitor job postings to identify strategic hiring patterns and growth areas',
          status: 'error',
          total_insights: 8,
          competitor_ids: ['1', '3'],
          last_run: '2024-01-14T12:30:00Z',
          created_at: '2024-01-05T00:00:00Z',
          triggers: ['job-postings', 'hiring-trends'],
          frequency: 'weekly'
        }
      ]);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter agents
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    const matchesFrequency = frequencyFilter === 'all' || agent.frequency === frequencyFilter;
    const matchesMonitor = monitorFilter === 'all' || 
      agent.triggers.some(trigger => {
        switch(monitorFilter) {
          case 'news': return trigger.includes('news') || trigger.includes('media');
          case 'social': return trigger.includes('social');
          case 'product': return trigger.includes('product') || trigger.includes('website');
          case 'pricing': return trigger.includes('pricing');
          case 'hiring': return trigger.includes('job') || trigger.includes('hiring');
          default: return true;
        }
      });
    
    return matchesSearch && matchesStatus && matchesFrequency && matchesMonitor;
  });


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
          <p className="mt-4 text-gray-600">Loading AI agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-6">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">All AI Agents</h1>
                <p className="text-gray-600">Manage and monitor {filteredAgents.length} intelligence agents</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                  >
                    <option value="all">All Agent Status</option>
                    <option value="active">✅ Active</option>
                    <option value="paused">⏸️ Paused</option>
                    <option value="error">⚠️ Error</option>
                  </select>
                </div>

                <select
                  value={frequencyFilter}
                  onChange={(e) => setFrequencyFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                >
                  <option value="all">All Frequencies</option>
                  <option value="hourly">⏰ Every Hour</option>
                  <option value="daily">📅 Daily</option>
                  <option value="weekly">📆 Weekly</option>
                </select>

                <select
                  value={monitorFilter}
                  onChange={(e) => setMonitorFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                >
                  <option value="all">All Monitor Types</option>
                  <option value="news">📰 News & Media</option>
                  <option value="social">📱 Social Media</option>
                  <option value="product">🚀 Product Updates</option>
                  <option value="pricing">💰 Pricing Changes</option>
                  <option value="hiring">👥 Hiring Trends</option>
                </select>


                <button 
                  onClick={() => router.push('/agents/create')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Agent</span>
                </button>
              </div>
            </div>
          </div>

          {/* Agent Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredAgents.map((agent) => (
              <div 
                key={agent.id} 
                onClick={() => router.push(`/agents/${agent.id}`)}
                className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all duration-200 h-[200px] flex flex-col cursor-pointer focus:outline-none"
              >
                <div className="p-4 flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-100 flex-shrink-0">
                      <Zap className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{agent.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{agent.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(agent.status)} flex items-center space-x-1`}>
                      {getStatusIcon(agent.status)}
                      <span>{agent.status.toUpperCase()}</span>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/agents/${agent.id}/edit`);
                        }}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/agents/${agent.id}`);
                        }}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Last run</div>
                      <div className="text-xs text-gray-700 font-medium">{formatDate(agent.last_run)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Zap className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters, or create a new agent to get started.</p>
              <button 
                onClick={() => router.push('/agents/create')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Agent</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}