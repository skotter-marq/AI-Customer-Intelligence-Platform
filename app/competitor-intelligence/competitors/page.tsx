'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Search,
  Filter,
  Building,
  AlertTriangle,
  Activity,
  ExternalLink,
  Zap,
  Edit,
  Plus,
  Target,
  MapPin,
  Globe,
  TrendingUp
} from 'lucide-react';

interface CompetitorProfile {
  id: string;
  name: string;
  logo: string;
  industry: string;
  location: string;
  website: string;
  status: 'active' | 'inactive';
  threat_level: 'high' | 'medium' | 'low';
  description: string;
  last_updated: string;
}

export default function AllCompetitorsPage() {
  const router = useRouter();
  const [competitors, setCompetitors] = useState<CompetitorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [threatFilter, setThreatFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const fetchCompetitors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/competitors');
      
      if (response.ok) {
        const result = await response.json();
        const competitorsData = result.competitors.map((competitor: any) => ({
          id: competitor.id,
          name: competitor.name,
          logo: `https://logo.clearbit.com/${competitor.domain || 'example.com'}`,
          industry: competitor.industry || 'Technology',
          location: competitor.location || 'N/A',
          website: competitor.domain,
          status: competitor.status,
          threat_level: competitor.threat_level,
          description: competitor.description || 'No description available',
          last_updated: competitor.updated_at,
        }));
        setCompetitors(competitorsData);
      } else {
        // Mock data for development
        setCompetitors([
          {
            id: '1',
            name: 'TechCorp Solutions',
            logo: '🏢',
            industry: 'Technology',
            location: 'San Francisco, CA',
            website: 'techcorp.com',
            status: 'active',
            threat_level: 'high',
            description: 'Leading AI-powered customer intelligence platform',
            last_updated: '2024-01-15'
          },
          {
            id: '2',
            name: 'DataVision Inc',
            logo: '📊',
            industry: 'Analytics',
            location: 'Seattle, WA',
            website: 'datavision.io',
            status: 'active',
            threat_level: 'medium',
            description: 'Business intelligence and data visualization tools',
            last_updated: '2024-01-14'
          },
          {
            id: '3',
            name: 'InsightFlow',
            logo: '💡',
            industry: 'SaaS',
            location: 'Austin, TX',
            website: 'insightflow.com',
            status: 'inactive',
            threat_level: 'low',
            description: 'Customer feedback and insights platform',
            last_updated: '2024-01-10'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching competitors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter competitors
  const filteredCompetitors = competitors.filter(competitor => {
    const matchesSearch = competitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         competitor.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         competitor.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesThreat = threatFilter === 'all' || competitor.threat_level === threatFilter;
    const matchesStatus = statusFilter === 'all' || competitor.status === statusFilter;
    const matchesIndustry = industryFilter === 'all' || competitor.industry === industryFilter;
    const matchesLocation = locationFilter === 'all' || competitor.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesThreat && matchesStatus && matchesIndustry && matchesLocation;
  });


  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const uniqueIndustries = [...new Set(competitors.map(c => c.industry))];
  const uniqueLocations = [...new Set(competitors.map(c => c.location.split(',')[0].trim()))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading competitors...</p>
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
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">All Competitors</h1>
                <p className="text-gray-600">Manage and analyze {filteredCompetitors.length} competitors</p>
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
                    placeholder="Search competitors..."
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
                    value={threatFilter}
                    onChange={(e) => setThreatFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                  >
                    <option value="all">All Threat Levels</option>
                    <option value="high">🔴 High Threat</option>
                    <option value="medium">🟡 Medium Threat</option>
                    <option value="low">🟢 Low Threat</option>
                  </select>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                >
                  <option value="all">All Monitoring Status</option>
                  <option value="active">🟢 Active Monitoring</option>
                  <option value="inactive">⏸️ Paused</option>
                </select>

                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                >
                  <option value="all">All Industries</option>
                  {uniqueIndustries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>

                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                >
                  <option value="all">All Locations</option>
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>📍 {location}</option>
                  ))}
                </select>


                <button 
                  onClick={() => router.push('/competitor-intelligence/add-competitor')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Competitor</span>
                </button>
              </div>
            </div>
          </div>

          {/* Competitor Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredCompetitors.map((competitor) => (
              <div 
                key={competitor.id} 
                onClick={() => router.push(`/competitor-intelligence/competitors/${competitor.id}`)}
                className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all duration-200 h-[220px] flex flex-col cursor-pointer"
              >
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
                          {competitor.logo || competitor.name.charAt(0)}
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
                      {competitor.description?.includes('Leading') 
                        ? 'Launched new AI features • Expanding enterprise sales team'
                        : competitor.description?.includes('Business intelligence') 
                          ? 'Released Q4 analytics update • Growing market share'
                          : 'No recent activity detected • Monitoring for updates'
                      }
                    </p>
                  </div>

                  {/* Spacer to push actions to bottom */}
                  <div className="flex-1"></div>

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(competitor.website?.startsWith('http') ? competitor.website : `https://${competitor.website}`, '_blank')}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                        title="Visit website"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Visit</span>
                      </button>
                      
                      <button
                        onClick={() => console.log('View agent insights for', competitor.name)}
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
            ))}
          </div>

          {filteredCompetitors.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Building className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No competitors found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters, or add a new competitor to get started.</p>
              <button 
                onClick={() => router.push('/competitor-intelligence/add-competitor')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Competitor</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}