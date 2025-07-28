'use client';

import { useState, useEffect } from 'react';
import { 
  Search,
  Filter,
  ExternalLink,
  Star,
  Users,
  Zap,
  BarChart3,
  MessageSquare,
  Calendar,
  FileText,
  Globe,
  Database,
  Bot,
  Shield,
  Smartphone,
  Mail,
  Video,
  Clock,
  TrendingUp,
  Target,
  Package,
  Settings,
  Heart,
  Award,
  ChevronRight,
  Eye,
  CheckCircle
} from 'lucide-react';

interface App {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  category: 'productivity' | 'analytics' | 'communication' | 'crm' | 'marketing' | 'sales' | 'support' | 'developer' | 'ai' | 'all';
  type: 'webapp' | 'mobile' | 'desktop' | 'api' | 'widget';
  externalUrl: string;
  popular: boolean;
  featured: boolean;
  tags: string[];
  features: string[];
  screenshots?: string[];
  developer: string;
  lastUpdated: string;
  integrations: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
}

export default function AppMarketplace() {
  const [apps, setApps] = useState<App[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'name' | 'newest'>('popular');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateApp, setShowCreateApp] = useState(false);
  const [newAppData, setNewAppData] = useState({
    name: '',
    developer: '',
    description: '',
    longDescription: '',
    category: 'analytics',
    type: 'webapp',
    url: '',
    tags: '',
    features: '',
    integrations: '',
    popular: false,
    featured: false
  });

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    
    // Mock data representing apps/tools built by the product team
    const mockApps: App[] = [
      {
        id: '1',
        name: 'Customer Intelligence Dashboard',
        description: 'Comprehensive AI-powered customer insights and analytics platform',
        longDescription: 'Transform your customer data into actionable insights with our flagship AI-powered dashboard. Get real-time analytics, predictive insights, and automated reporting.',
        image: '/api/placeholder/400/240',
        category: 'analytics',
        type: 'webapp',
        externalUrl: 'https://dashboard.company.com',
        popular: true,
        featured: true,
        tags: ['AI', 'Analytics', 'Dashboard', 'Real-time'],
        features: ['Real-time Analytics', 'AI Insights', 'Custom Reports', 'API Access'],
        developer: 'Product Team',
        lastUpdated: '2024-01-15',
        integrations: ['HubSpot', 'Salesforce', 'Slack'],
        icon: BarChart3,
        color: 'blue'
      },
      {
        id: '2',
        name: 'Meeting Intelligence Bot',
        description: 'AI bot that joins meetings and provides instant insights and summaries',
        longDescription: 'Never miss important meeting details again. Our AI bot automatically joins your calls, takes notes, and generates actionable insights.',
        image: '/api/placeholder/400/240',
        category: 'ai',
        type: 'webapp',
        externalUrl: 'https://meetingbot.company.com',
        popular: true,
        featured: true,
        tags: ['AI', 'Meetings', 'Automation', 'Transcription'],
        features: ['Auto-join Meetings', 'Real-time Transcription', 'AI Summaries', 'Action Items'],
        developer: 'AI Team',
        lastUpdated: '2024-01-12',
        integrations: ['Zoom', 'Teams', 'Google Meet'],
        icon: Bot,
        color: 'purple'
      },
      {
        id: '3',
        name: 'Customer Health Predictor',
        description: 'Predict customer churn and identify expansion opportunities',
        longDescription: 'Use machine learning to predict which customers are at risk of churning and identify opportunities for account expansion.',
        image: '/api/placeholder/400/240',
        category: 'analytics',
        type: 'webapp',
        externalUrl: 'https://health.company.com',
        popular: false,
        featured: true,
        tags: ['ML', 'Predictions', 'Customer Success', 'Analytics'],
        features: ['Churn Prediction', 'Health Scoring', 'Expansion Alerts', 'Custom Models'],
        developer: 'Data Science Team',
        lastUpdated: '2024-01-10',
        integrations: ['HubSpot', 'Intercom', 'Zendesk'],
        icon: TrendingUp,
        color: 'green'
      },
      {
        id: '4',
        name: 'Smart Email Campaign Builder',
        description: 'Create personalized email campaigns using AI and customer data',
        longDescription: 'Build highly targeted email campaigns that convert. Use AI to personalize content and optimize send times for maximum engagement.',
        image: '/api/placeholder/400/240',
        category: 'marketing',
        type: 'webapp',
        externalUrl: 'https://email.company.com',
        popular: true,
        featured: false,
        tags: ['Email', 'Marketing', 'AI', 'Personalization'],
        features: ['AI Personalization', 'A/B Testing', 'Send Time Optimization', 'Analytics'],
        developer: 'Marketing Team',
        lastUpdated: '2024-01-08',
        integrations: ['Mailchimp', 'SendGrid', 'HubSpot'],
        icon: Mail,
        color: 'orange'
      },
      {
        id: '5',
        name: 'Sales Pipeline Optimizer',
        description: 'Optimize your sales process with AI-powered pipeline analysis',
        longDescription: 'Identify bottlenecks in your sales process and get recommendations to improve conversion rates at every stage.',
        image: '/api/placeholder/400/240',
        category: 'sales',
        type: 'webapp',
        externalUrl: 'https://pipeline.company.com',
        popular: false,
        featured: false,
        tags: ['Sales', 'Pipeline', 'Optimization', 'CRM'],
        features: ['Pipeline Analysis', 'Bottleneck Detection', 'Win Rate Optimization', 'Forecasting'],
        developer: 'Sales Engineering Team',
        lastUpdated: '2024-01-05',
        integrations: ['Salesforce', 'HubSpot', 'Pipedrive'],
        icon: Target,
        color: 'red'
      },
      {
        id: '6',
        name: 'Support Ticket Intelligence',
        description: 'AI-powered support ticket analysis and automated routing',
        longDescription: 'Automatically categorize, prioritize, and route support tickets using AI. Reduce response times and improve customer satisfaction.',
        image: '/api/placeholder/400/240',
        category: 'support',
        type: 'webapp',
        externalUrl: 'https://support.company.com',
        popular: false,
        featured: false,
        tags: ['Support', 'AI', 'Automation', 'Tickets'],
        features: ['Auto-categorization', 'Smart Routing', 'Priority Scoring', 'Response Templates'],
        developer: 'Support Team',
        lastUpdated: '2024-01-03',
        integrations: ['Zendesk', 'Intercom', 'Freshdesk'],
        icon: MessageSquare,
        color: 'indigo'
      },
      {
        id: '7',
        name: 'Mobile Analytics Companion',
        description: 'Access your customer insights on the go with our mobile app',
        longDescription: 'Never miss important customer insights while you\'re away from your desk. Get push notifications for urgent alerts and view key metrics.',
        image: '/api/placeholder/400/240',
        category: 'productivity',
        type: 'mobile',
        externalUrl: 'https://apps.apple.com/app/company-mobile',
        popular: true,
        featured: false,
        tags: ['Mobile', 'Analytics', 'Notifications', 'iOS'],
        features: ['Push Notifications', 'Offline Access', 'Quick Insights', 'Dark Mode'],
        developer: 'Mobile Team',
        lastUpdated: '2024-01-01',
        integrations: ['Dashboard', 'Slack', 'Teams'],
        icon: Smartphone,
        color: 'pink'
      },
      {
        id: '8',
        name: 'API Analytics Suite',
        description: 'Developer tools and APIs for custom integrations',
        longDescription: 'Build custom integrations and applications using our comprehensive API suite. Includes SDKs, documentation, and analytics.',
        image: '/api/placeholder/400/240',
        category: 'developer',
        type: 'api',
        externalUrl: 'https://developers.company.com',
        popular: false,
        featured: false,
        tags: ['API', 'SDK', 'Developer', 'Integration'],
        features: ['REST API', 'GraphQL', 'Webhooks', 'Rate Limiting'],
        developer: 'Platform Team',
        lastUpdated: '2023-12-28',
        integrations: ['Any Platform', 'Custom Apps'],
        icon: Settings,
        color: 'gray'
      }
    ];

    const mockCategories: Category[] = [
      { id: 'all', name: 'All Apps', description: 'Browse all available applications', icon: Package, count: mockApps.length },
      { id: 'analytics', name: 'Analytics', description: 'Data analysis and reporting tools', icon: BarChart3, count: mockApps.filter(a => a.category === 'analytics').length },
      { id: 'ai', name: 'AI & ML', description: 'Artificial intelligence and machine learning', icon: Bot, count: mockApps.filter(a => a.category === 'ai').length },
      { id: 'marketing', name: 'Marketing', description: 'Marketing automation and campaign tools', icon: Mail, count: mockApps.filter(a => a.category === 'marketing').length },
      { id: 'sales', name: 'Sales', description: 'Sales optimization and CRM tools', icon: Target, count: mockApps.filter(a => a.category === 'sales').length },
      { id: 'support', name: 'Support', description: 'Customer support and service tools', icon: MessageSquare, count: mockApps.filter(a => a.category === 'support').length },
      { id: 'productivity', name: 'Productivity', description: 'Productivity and workflow tools', icon: Zap, count: mockApps.filter(a => a.category === 'productivity').length },
      { id: 'developer', name: 'Developer', description: 'APIs and developer tools', icon: Settings, count: mockApps.filter(a => a.category === 'developer').length }
    ];

    setApps(mockApps);
    setCategories(mockCategories);
    setLoading(false);
  };

  const filteredAndSortedApps = apps
    .filter(app => {
      const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });

  const featuredApps = apps.filter(app => app.featured);


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'webapp': return Globe;
      case 'mobile': return Smartphone;
      case 'desktop': return Package;
      case 'api': return Settings;
      case 'widget': return Zap;
      default: return Package;
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
                <p className="calendly-body mt-4">Loading marketplace...</p>
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
          <div className="flex items-center justify-between mb-12">
            <div className="flex-1">
              <h1 className="calendly-h1 mb-4">App Marketplace</h1>
              <p className="calendly-body text-gray-600 max-w-2xl">
                Discover powerful apps and tools built by our product team to supercharge your customer intelligence workflow
              </p>
            </div>
            <div className="ml-8">
              <button
                onClick={() => setShowCreateApp(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Package className="w-4 h-4" />
                <span>Add App</span>
              </button>
            </div>
          </div>

          {/* Create App Form */}
          {showCreateApp && (
            <div className="calendly-card mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New App</h2>
                <button
                  onClick={() => setShowCreateApp(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">App Name</label>
                    <input
                      type="text"
                      value={newAppData.name}
                      onChange={(e) => setNewAppData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter app name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Developer Team</label>
                    <input
                      type="text"
                      value={newAppData.developer}
                      onChange={(e) => setNewAppData(prev => ({ ...prev, developer: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Product Team"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                  <input
                    type="text"
                    value={newAppData.description}
                    onChange={(e) => setNewAppData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description for app cards"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Long Description</label>
                  <textarea
                    rows={3}
                    value={newAppData.longDescription}
                    onChange={(e) => setNewAppData(prev => ({ ...prev, longDescription: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed description of the app's purpose and capabilities"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select 
                      value={newAppData.category}
                      onChange={(e) => setNewAppData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="analytics">Analytics</option>
                      <option value="ai">AI & ML</option>
                      <option value="marketing">Marketing</option>
                      <option value="sales">Sales</option>
                      <option value="support">Support</option>
                      <option value="productivity">Productivity</option>
                      <option value="developer">Developer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">App Type</label>
                    <select 
                      value={newAppData.type}
                      onChange={(e) => setNewAppData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="webapp">Web App</option>
                      <option value="mobile">Mobile App</option>
                      <option value="desktop">Desktop App</option>
                      <option value="api">API/SDK</option>
                      <option value="widget">Widget</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">App URL</label>
                  <input
                    type="url"
                    value={newAppData.url}
                    onChange={(e) => setNewAppData(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://app.company.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <input
                      type="text"
                      value={newAppData.tags}
                      onChange={(e) => setNewAppData(prev => ({ ...prev, tags: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="AI, Analytics, Dashboard (comma separated)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Integrations</label>
                    <input
                      type="text"
                      value={newAppData.integrations}
                      onChange={(e) => setNewAppData(prev => ({ ...prev, integrations: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="HubSpot, Salesforce, Slack (comma separated)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key Features</label>
                  <textarea
                    rows={2}
                    value={newAppData.features}
                    onChange={(e) => setNewAppData(prev => ({ ...prev, features: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Real-time Analytics, AI Insights, Custom Reports (comma separated)"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={newAppData.popular}
                      onChange={(e) => setNewAppData(prev => ({ ...prev, popular: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Mark as Popular</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={newAppData.featured}
                      onChange={(e) => setNewAppData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured App</span>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateApp(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Add App
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search and Filters */}
          <div className="calendly-card mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search apps, features, or categories..."
                    className="w-full pl-12 pr-4 py-3 calendly-body-sm transition-all duration-200 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              
              {/* Sort */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="popular">Most Popular</option>
                  <option value="name">Name A-Z</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
          </div>


          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Categories Sidebar */}
              <div className="lg:col-span-1">
                <div className="calendly-card sticky top-6">
                  <h3 className="calendly-h3 mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const CategoryIcon = category.icon;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                            selectedCategory === category.id
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <CategoryIcon className="w-5 h-5" />
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {category.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Apps Grid */}
              <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="calendly-h2">
                  {selectedCategory === 'all' ? 'All Apps' : categories.find(c => c.id === selectedCategory)?.name}
                  <span className="text-gray-500 font-normal text-base ml-2">
                    ({filteredAndSortedApps.length} {filteredAndSortedApps.length === 1 ? 'app' : 'apps'})
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAndSortedApps.map((app) => {
                  const AppIcon = app.icon;
                  const TypeIcon = getTypeIcon(app.type);
                  
                  return (
                    <div key={app.id} className="calendly-card group cursor-pointer transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-start space-x-4">
                        <div className={`w-16 h-16 rounded-xl bg-${app.color}-100 flex items-center justify-center flex-shrink-0`}>
                          <AppIcon className={`w-8 h-8 text-${app.color}-600`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="calendly-h4 truncate">{app.name}</h3>
                            <div className="flex items-center space-x-1 ml-2">
                              {app.popular && (
                                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                              )}
                              <TypeIcon className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                          
                          <p className="calendly-body-sm text-gray-600 line-clamp-2 mb-3">
                            {app.description}
                          </p>

                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-1">
                              <span className="text-sm text-gray-600">by {app.developer}</span>
                            </div>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Internal Tool
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {app.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => window.open(app.externalUrl, '_blank')}
                              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                            >
                              <span>Launch App</span>
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => window.location.href = `/integrations/${app.id}`}
                              className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-1"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Details</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredAndSortedApps.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="calendly-h3 mb-2">No apps found</h3>
                  <p className="calendly-body text-gray-600">
                    Try adjusting your search or browse different categories
                  </p>
                </div>
              )}
              </div>
            </div>


          </div>


        </div>
      </div>
    </div>
  );
}