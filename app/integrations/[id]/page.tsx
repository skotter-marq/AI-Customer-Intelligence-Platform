'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  Calendar,
  Globe,
  Smartphone,
  Package,
  Settings,
  BarChart3,
  Bot,
  TrendingUp,
  Target,
  MessageSquare,
  Mail
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

export default function AppDetailsPage() {
  const params = useParams();
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppDetails();
  }, [params.id]);

  const fetchAppDetails = async () => {
    setLoading(true);
    
    // Mock data - in real app, this would fetch from API
    const mockApps: App[] = [
      {
        id: '1',
        name: 'Customer Intelligence Dashboard',
        description: 'Comprehensive AI-powered customer insights and analytics platform',
        longDescription: 'Transform your customer data into actionable insights with our flagship AI-powered dashboard. Get real-time analytics, predictive insights, and automated reporting that help you understand customer behavior, predict trends, and make data-driven decisions.',
        image: '/api/placeholder/400/240',
        category: 'analytics',
        type: 'webapp',
        externalUrl: 'https://dashboard.company.com',
        popular: true,
        featured: true,
        tags: ['AI', 'Analytics', 'Dashboard', 'Real-time'],
        features: ['Real-time Analytics', 'AI Insights', 'Custom Reports', 'API Access', 'Data Export', 'Team Collaboration'],
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
        longDescription: 'Never miss important meeting details again. Our AI bot automatically joins your calls, takes notes, and generates actionable insights. Get meeting summaries, action items, and key decisions delivered instantly.',
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
        longDescription: 'Use machine learning to predict which customers are at risk of churning and identify opportunities for account expansion. Our advanced algorithms analyze customer behavior patterns to provide actionable insights.',
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

    const foundApp = mockApps.find(a => a.id === params.id);
    setApp(foundApp || null);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#4285f4' }}></div>
                <p className="calendly-body mt-4">Loading app details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h1 className="calendly-h1 mb-4">App Not Found</h1>
              <p className="calendly-body text-gray-600 mb-8">The app you're looking for doesn't exist.</p>
              <Link href="/integrations" className="calendly-btn-primary">
                Back to App Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const AppIcon = app.icon;

  return (
    <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
      {/* Navigation */}
      <div className="calendly-card-static border-b" style={{ margin: '0 24px 24px 24px', padding: '16px 24px', borderRadius: '0' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link
              href="/integrations"
              className="p-2 rounded-lg"
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
            </Link>
            <div className="flex items-center space-x-2">
              <Link 
                href="/integrations"
                className="calendly-body-sm"
                style={{ color: '#718096' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#4285f4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#718096';
                }}
              >
                Integrations
              </Link>
              <span style={{ color: '#a0aec0' }}>›</span>
              <span className="calendly-body-sm font-medium" style={{ color: '#1a1a1a' }}>{app.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">

          {/* App Header */}
          <div className="calendly-card" style={{ padding: '32px', marginBottom: '24px' }}>
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-6">
              <div className="flex items-center justify-center sm:justify-start">
                <div className={`w-16 h-16 rounded-xl bg-${app.color}-100 flex items-center justify-center`}>
                  <AppIcon className={`w-8 h-8 text-${app.color}-600`} />
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{app.name}</h1>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
                  <span className="text-gray-800 text-base font-medium">by {app.developer}</span>
                  <span className="text-gray-400">•</span>
                  <span className="px-3 py-1.5 rounded-full text-sm font-semibold border bg-green-100 text-green-800 border-green-200">
                    INTERNAL TOOL
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {app.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {app.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => window.open(app.externalUrl, '_blank')}
                  className="calendly-btn-primary flex items-center space-x-2"
                >
                  <span>Launch App</span>
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* About */}
              <div className="calendly-card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About this app</h2>
                <p className="text-gray-700">{app.longDescription}</p>
              </div>

              {/* Features */}
              <div className="calendly-card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {app.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Integrations */}
              <div className="calendly-card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Integrations</h2>
                <p className="text-gray-600 mb-4">
                  This app integrates seamlessly with your existing tools and workflows.
                </p>
                <div className="flex flex-wrap gap-3">
                  {app.integrations.map((integration, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg">
                      <div className="w-6 h-6 bg-blue-200 rounded flex items-center justify-center">
                        <span className="text-xs font-medium">{integration.charAt(0)}</span>
                      </div>
                      <span className="font-medium">{integration}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* App Details */}
              <div className="calendly-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">App Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Category</span>
                    <span className="font-semibold text-gray-900 capitalize">{app.category}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Type</span>
                    <span className="font-semibold text-gray-900 capitalize">{app.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Developer</span>
                    <span className="font-semibold text-gray-900">{app.developer}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(app.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="calendly-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                  {app.popular && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Popular</span>
                    </div>
                  )}
                  {app.featured && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Featured</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Launch Button */}
              <button
                onClick={() => window.open(app.externalUrl, '_blank')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Launch App</span>
                <ExternalLink className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}