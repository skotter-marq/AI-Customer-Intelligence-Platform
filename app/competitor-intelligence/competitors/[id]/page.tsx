'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Building,
  Globe,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  DollarSign,
  Target,
  AlertTriangle,
  ExternalLink,
  Zap,
  Package,
  BarChart3,
  Eye,
  MessageSquare,
  Share2,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Star,
  ChevronRight
} from 'lucide-react';

interface CompetitorDetail {
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
  founded: string;
  employees: string;
  revenue: string;
  funding: string;
  social: {
    linkedin?: string;
    twitter?: string;
  };
}

interface ProductFeature {
  name: string;
  ourProduct: 'yes' | 'no' | 'partial';
  competitor: 'yes' | 'no' | 'partial';
  advantage: 'us' | 'them' | 'neutral';
  notes: string;
}

export default function CompetitorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const competitorId = params.id as string;
  
  const [competitor, setCompetitor] = useState<CompetitorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'pricing' | 'intelligence' | 'swot'>('overview');

  useEffect(() => {
    fetchCompetitorDetail();
  }, [competitorId]);

  const fetchCompetitorDetail = async () => {
    try {
      setLoading(true);
      // Mock data for now - in production, this would fetch from API
      const mockData: CompetitorDetail = {
        id: competitorId,
        name: competitorId === '1' ? 'TechCorp Solutions' : competitorId === '2' ? 'DataVision Inc' : 'InsightFlow',
        logo: competitorId === '1' ? '🏢' : competitorId === '2' ? '📊' : '💡',
        industry: competitorId === '1' ? 'Technology' : competitorId === '2' ? 'Analytics' : 'SaaS',
        location: competitorId === '1' ? 'San Francisco, CA' : competitorId === '2' ? 'Seattle, WA' : 'Austin, TX',
        website: competitorId === '1' ? 'techcorp.com' : competitorId === '2' ? 'datavision.io' : 'insightflow.com',
        status: 'active',
        threat_level: competitorId === '1' ? 'high' : competitorId === '2' ? 'medium' : 'low',
        description: competitorId === '1' ? 'Leading AI-powered customer intelligence platform with advanced analytics and automation capabilities.' : 
                    competitorId === '2' ? 'Business intelligence and data visualization tools with strong market presence.' :
                    'Customer feedback and insights platform with growing user base.',
        last_updated: '2024-01-15',
        founded: competitorId === '1' ? '2018' : competitorId === '2' ? '2015' : '2020',
        employees: competitorId === '1' ? '250-500' : competitorId === '2' ? '100-250' : '50-100',
        revenue: competitorId === '1' ? '$50-100M' : competitorId === '2' ? '$20-50M' : '$5-20M',
        funding: competitorId === '1' ? 'Series C - $75M' : competitorId === '2' ? 'Series B - $30M' : 'Seed - $5M',
        social: {
          linkedin: `linkedin.com/company/${competitorId === '1' ? 'techcorp' : competitorId === '2' ? 'datavision' : 'insightflow'}`,
          twitter: `@${competitorId === '1' ? 'TechCorp' : competitorId === '2' ? 'DataVision' : 'InsightFlow'}`
        }
      };
      
      setCompetitor(mockData);
    } catch (error) {
      console.error('Error fetching competitor detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const productFeatures: ProductFeature[] = [
    {
      name: 'AI-Powered Analytics',
      ourProduct: 'yes',
      competitor: competitor?.threat_level === 'high' ? 'yes' : competitor?.threat_level === 'medium' ? 'partial' : 'no',
      advantage: competitor?.threat_level === 'high' ? 'neutral' : 'us',
      notes: competitor?.threat_level === 'high' ? 'Strong AI capabilities, direct competitor' : 'Basic analytics only'
    },
    {
      name: 'Real-time Monitoring',
      ourProduct: 'yes',
      competitor: competitor?.threat_level === 'low' ? 'no' : 'yes',
      advantage: competitor?.threat_level === 'low' ? 'us' : 'neutral',
      notes: 'Core feature comparison'
    },
    {
      name: 'Custom Dashboards',
      ourProduct: 'yes',
      competitor: 'yes',
      advantage: 'neutral',
      notes: 'Standard feature across platforms'
    },
    {
      name: 'API Integration',
      ourProduct: 'yes',
      competitor: competitor?.threat_level === 'high' ? 'yes' : 'partial',
      advantage: competitor?.threat_level === 'high' ? 'neutral' : 'us',
      notes: 'Comprehensive API vs limited endpoints'
    },
    {
      name: 'Mobile App',
      ourProduct: 'partial',
      competitor: competitor?.name.includes('Tech') ? 'yes' : 'no',
      advantage: competitor?.name.includes('Tech') ? 'them' : 'us',
      notes: 'Native mobile experience comparison'
    }
  ];

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFeatureIcon = (status: string) => {
    switch (status) {
      case 'yes': return <div className="w-2 h-2 bg-green-400 rounded-full"></div>;
      case 'partial': return <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>;
      case 'no': return <div className="w-2 h-2 bg-red-400 rounded-full"></div>;
      default: return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  const getAdvantageColor = (advantage: string) => {
    switch (advantage) {
      case 'us': return 'bg-green-50 border-green-200';
      case 'them': return 'bg-red-50 border-red-200';
      case 'neutral': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading competitor details...</p>
        </div>
      </div>
    );
  }

  if (!competitor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Competitor not found</h2>
          <p className="text-gray-600 mb-4">The competitor you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
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
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white shadow-sm border">
                    <span className="text-2xl">{competitor.logo}</span>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{competitor.name}</h1>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-gray-600">{competitor.industry}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{competitor.location}</span>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getThreatColor(competitor.threat_level)}`}>
                        {competitor.threat_level.toUpperCase()} THREAT
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.open(`https://${competitor.website}`, '_blank')}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visit Site</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <Zap className="w-4 h-4" />
                  <span>AI Insights</span>
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview', icon: Building },
                  { id: 'features', label: 'Features', icon: Package },
                  { id: 'pricing', label: 'Pricing', icon: DollarSign },
                  { id: 'intelligence', label: 'Intelligence', icon: BarChart3 },
                  { id: 'swot', label: 'SWOT', icon: Target }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Company Overview */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Overview</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">{competitor.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">{competitor.founded}</div>
                      <div className="text-xs text-gray-600">Founded</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Users className="w-5 h-5 text-gray-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">{competitor.employees}</div>
                      <div className="text-xs text-gray-600">Employees</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <DollarSign className="w-5 h-5 text-gray-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">{competitor.revenue}</div>
                      <div className="text-xs text-gray-600">Revenue</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-gray-600 mx-auto mb-2" />
                      <div className="text-sm font-medium text-gray-900">{competitor.funding}</div>
                      <div className="text-xs text-gray-600">Funding</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Product Launch</p>
                        <p className="text-sm text-blue-700">Released new AI-powered analytics dashboard</p>
                        <p className="text-xs text-blue-600 mt-1">3 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Funding Round</p>
                        <p className="text-sm text-green-700">Completed Series B funding round</p>
                        <p className="text-xs text-green-600 mt-1">1 week ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <Users className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900">Team Expansion</p>
                        <p className="text-sm text-yellow-700">Hiring 50+ engineers across multiple locations</p>
                        <p className="text-xs text-yellow-600 mt-1">2 weeks ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Monitoring Status</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">Active</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Updated</span>
                      <span className="text-sm font-medium text-gray-900">{competitor.last_updated}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Threat Level</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getThreatColor(competitor.threat_level)}`}>
                        {competitor.threat_level.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Links & Social</h3>
                  <div className="space-y-3">
                    <a
                      href={`https://${competitor.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Globe className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-900">{competitor.website}</span>
                      <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                    </a>
                    {competitor.social.linkedin && (
                      <a
                        href={`https://${competitor.social.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Linkedin className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-900">LinkedIn</span>
                        <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                      </a>
                    )}
                    {competitor.social.twitter && (
                      <a
                        href={`https://twitter.com/${competitor.social.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Twitter className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-900">{competitor.social.twitter}</span>
                        <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center space-x-3 p-2 text-left rounded-lg hover:bg-gray-50 transition-colors">
                      <Eye className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-900">Set Alert</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-2 text-left rounded-lg hover:bg-gray-50 transition-colors">
                      <Share2 className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-900">Share Analysis</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-2 text-left rounded-lg hover:bg-gray-50 transition-colors">
                      <MessageSquare className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-900">Add Notes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Feature Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Feature</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">Our Product</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-900">{competitor.name}</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productFeatures.map((feature, index) => (
                      <tr key={index} className={`border-b border-gray-100 ${getAdvantageColor(feature.advantage)}`}>
                        <td className="py-3 px-4 font-medium text-gray-900">{feature.name}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {getFeatureIcon(feature.ourProduct)}
                            <span className="text-sm capitalize">{feature.ourProduct}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {getFeatureIcon(feature.competitor)}
                            <span className="text-sm capitalize">{feature.competitor}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{feature.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Full Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Partial Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span>Not Available</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Intelligence</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-900">Starter Plan</span>
                      <span className="text-lg font-bold text-blue-900">$99/mo</span>
                    </div>
                    <p className="text-sm text-blue-700">Up to 10,000 contacts, basic analytics</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-purple-900">Professional</span>
                      <span className="text-lg font-bold text-purple-900">$299/mo</span>
                    </div>
                    <p className="text-sm text-purple-700">Up to 50,000 contacts, advanced features</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-900">Enterprise</span>
                      <span className="text-lg font-bold text-green-900">Custom</span>
                    </div>
                    <p className="text-sm text-green-700">Unlimited contacts, custom integrations</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Changes</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <TrendingUp className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Price Increase</p>
                      <p className="text-sm text-red-700">Starter plan increased by 20%</p>
                      <p className="text-xs text-red-600 mt-1">2 weeks ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Package className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900">New Features</p>
                      <p className="text-sm text-green-700">Added AI insights to Professional plan</p>
                      <p className="text-xs text-green-600 mt-1">1 month ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'intelligence' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Intelligence</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Growth Trajectory</span>
                    </div>
                    <p className="text-sm text-blue-700">35% YoY revenue growth, expanding rapidly</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-900">Target Market</span>
                    </div>
                    <p className="text-sm text-purple-700">Mid-market B2B companies, 100-1000 employees</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitive Alerts</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900">New Partnership</p>
                      <p className="text-xs text-yellow-700">Announced integration with Salesforce</p>
                    </div>
                    <span className="text-xs text-yellow-600">2h ago</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Product Update</p>
                      <p className="text-xs text-blue-700">Released new analytics dashboard</p>
                    </div>
                    <span className="text-xs text-blue-600">1d ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'swot' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Strengths</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Strong AI and machine learning capabilities</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Established market presence and brand recognition</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Comprehensive platform with multiple integrations</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Weaknesses</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <ChevronRight className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>High pricing may limit SMB adoption</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <ChevronRight className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Complex onboarding process</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <ChevronRight className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Limited mobile app functionality</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Opportunities</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Growing demand for AI-powered analytics</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Expansion into international markets</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Partnership opportunities with major CRMs</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Threats</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <ChevronRight className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>New entrants with innovative solutions</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <ChevronRight className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>Economic downturn affecting B2B spending</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <ChevronRight className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>Increasing data privacy regulations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}