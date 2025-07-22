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
  ChevronRight,
  Edit3,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase,
  Award,
  Shield,
  TrendingUp as Growth,
  FileText,
  Bot,
  Lightbulb,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Settings,
  Save,
  X,
  GitCompare,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Search,
  Bell,
  Download,
  Bookmark,
  Heart,
  Flame,
  TrendingUp as Trending,
  Info,
  Minus
} from 'lucide-react';

interface AIGeneratedContent {
  content: string;
  confidence: number;
  lastGenerated: string;
  sources: string[];
  isManuallyEdited: boolean;
}

interface CompetitorProfile {
  id: string;
  name: string;
  logo: string;
  industry: string;
  location: string;
  website: string;
  status: 'active' | 'inactive';
  threat_level: 'high' | 'medium' | 'low';
  founded: string;
  employees: string;
  revenue: string;
  funding: string;
  last_updated: string;
  social: {
    linkedin?: string;
    twitter?: string;
  };
  
  // Enhanced Profile Data
  overallScore: number;
  marketShare: number;
  customerSatisfaction: number;
  growthRate: number;
  innovationScore: number;
  userReviews: {
    totalReviews: number;
    averageRating: number;
    trustScore: number;
    recommendationRate: number;
  };
  
  // Tags and Categories
  tags: string[];
  key_products: string[];

  // AI Agents
  agents: Array<{
    id: string;
    name: string;
    type: 'pricing' | 'product' | 'marketing' | 'hiring' | 'social' | 'news';
    status: 'active' | 'paused' | 'error';
    lastRun: string;
    nextRun: string;
    frequency: string;
    insights: number;
    description: string;
  }>;
  
  // AI-Generated Sections
  executiveSummary: AIGeneratedContent;
  businessModel: AIGeneratedContent;
  marketPositioning: AIGeneratedContent;
  productIntelligence: {
    overview: AIGeneratedContent;
    keyFeatures: Array<{
      name: string;
      description: string;
      ourSupport: 'full' | 'partial' | 'none';
      theirSupport: 'full' | 'partial' | 'none';
      advantage: 'us' | 'them' | 'neutral';
    }>;
    pricingStrategy: AIGeneratedContent;
    integrations: AIGeneratedContent;
  };
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    lastUpdated: string;
  };
  competitiveIntelligence: Array<{
    id: string;
    type: 'pricing' | 'product' | 'marketing' | 'hiring' | 'funding' | 'partnership';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    timestamp: string;
    source: string;
    confidence: number;
  }>;
  
  // New Feed Data
  activityFeed: Array<{
    id: string;
    type: 'ai_insight' | 'product_update' | 'market_movement' | 'competitive_action' | 'customer_feedback';
    title: string;
    description: string;
    timestamp: string;
    importance: 'high' | 'medium' | 'low';
    category: string;
    actionRequired?: boolean;
    expandedContent?: {
      summary: string;
      keyFindings?: string[];
      impact: string;
      recommendations?: string[];
      confidence: number;
      sources?: string[];
      metrics?: Record<string, string>;
      technicalDetails?: Record<string, string>;
      campaignDetails?: Record<string, string>;
      topPositiveFeedback?: string[];
      remainingConcerns?: string[];
      implications?: string[];
      findings?: string[];
      riskAssessment?: string;
      improvements?: string[];
    };
  }>;
}

export default function CompetitorProfilePage() {
  const router = useRouter();
  const params = useParams();
  const competitorId = params.id as string;
  
  const [competitor, setCompetitor] = useState<CompetitorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'insights' | 'features' | 'pricing' | 'integrations' | 'feed'>('overview');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<'all' | 'ai_insight' | 'product_update' | 'competitive_action'>('all');
  const [bookmarked, setBookmarked] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    key_products: [] as string[],
    strengths: [] as string[],
    weaknesses: [] as string[]
  });
  
  // New section states
  const [featureSearchQuery, setFeatureSearchQuery] = useState('');
  const [selectedFeatureCategory, setSelectedFeatureCategory] = useState<'all' | 'core' | 'integration' | 'security' | 'pricing'>('all');
  const [pricingViewMode, setPricingViewMode] = useState<'comparison' | 'calculator' | 'trends'>('comparison');
  const [integrationFilter, setIntegrationFilter] = useState<'all' | 'native' | 'api' | 'third-party'>('all');

  useEffect(() => {
    fetchCompetitorProfile();
  }, [competitorId]);

  // Initialize edit form when competitor data changes
  useEffect(() => {
    if (competitor && isEditing) {
      setEditForm({
        key_products: [...competitor.key_products],
        strengths: [...competitor.swotAnalysis.strengths],
        weaknesses: [...competitor.swotAnalysis.weaknesses]
      });
    }
  }, [competitor, isEditing]);

  const fetchCompetitorProfile = async () => {
    try {
      setLoading(true);
      // Enhanced mock data with new profile structure
      const mockProfile: CompetitorProfile = {
        id: competitorId,
        name: competitorId === '1' ? 'Salesforce' : competitorId === '2' ? 'HubSpot' : competitorId === '3' ? 'Pipedrive' : 'Zendesk',
        logo: competitorId === '1' ? 'https://logo.clearbit.com/salesforce.com' : 
              competitorId === '2' ? 'https://logo.clearbit.com/hubspot.com' :
              competitorId === '3' ? 'https://logo.clearbit.com/pipedrive.com' : 
              'https://logo.clearbit.com/zendesk.com',
        industry: competitorId === '1' ? 'CRM & Sales Automation' : 
                 competitorId === '2' ? 'Inbound Marketing & Sales' : 
                 competitorId === '3' ? 'Sales CRM & Pipeline Management' : 'Customer Support & Service',
        location: competitorId === '1' ? 'San Francisco, CA' : 
                 competitorId === '2' ? 'Cambridge, MA' : 
                 competitorId === '3' ? 'Tallinn, Estonia' : 'San Francisco, CA',
        website: competitorId === '1' ? 'salesforce.com' : 
                competitorId === '2' ? 'hubspot.com' : 
                competitorId === '3' ? 'pipedrive.com' : 'zendesk.com',
        status: 'active',
        threat_level: competitorId === '1' || competitorId === '2' ? 'high' : 'medium',
        founded: competitorId === '1' ? '1999' : competitorId === '2' ? '2006' : competitorId === '3' ? '2010' : '2007',
        employees: competitorId === '1' ? '79,000+' : competitorId === '2' ? '7,000+' : competitorId === '3' ? '1,000+' : '6,000+',
        revenue: competitorId === '1' ? '$31.4B ARR' : competitorId === '2' ? '$1.7B ARR' : competitorId === '3' ? '$142M ARR' : '$1.67B ARR',
        funding: competitorId === '1' ? 'Public (NYSE: CRM)' : competitorId === '2' ? 'Public (NYSE: HUBS)' : competitorId === '3' ? '$90M Series B' : 'Public (NYSE: ZEN)',
        last_updated: '2024-01-15',
        social: {
          linkedin: `linkedin.com/company/${competitorId === '1' ? 'salesforce' : competitorId === '2' ? 'hubspot' : competitorId === '3' ? 'pipedrive' : 'zendesk'}`,
          twitter: competitorId === '1' ? '@Salesforce' : competitorId === '2' ? '@HubSpot' : competitorId === '3' ? '@Pipedrive' : '@Zendesk'
        },
        
        // Enhanced metrics
        overallScore: competitorId === '1' ? 94 : competitorId === '2' ? 89 : competitorId === '3' ? 78 : 85,
        marketShare: competitorId === '1' ? 23.1 : competitorId === '2' ? 8.7 : competitorId === '3' ? 2.3 : 12.4,
        customerSatisfaction: competitorId === '1' ? 4.2 : competitorId === '2' ? 4.6 : competitorId === '3' ? 4.5 : 4.1,
        growthRate: competitorId === '1' ? 18 : competitorId === '2' ? 32 : competitorId === '3' ? 41 : 15,
        innovationScore: competitorId === '1' ? 92 : competitorId === '2' ? 87 : competitorId === '3' ? 73 : 79,
        userReviews: {
          totalReviews: competitorId === '1' ? 18547 : competitorId === '2' ? 12834 : competitorId === '3' ? 5621 : 15342,
          averageRating: competitorId === '1' ? 4.2 : competitorId === '2' ? 4.6 : competitorId === '3' ? 4.5 : 4.1,
          trustScore: competitorId === '1' ? 89 : competitorId === '2' ? 92 : competitorId === '3' ? 94 : 87,
          recommendationRate: competitorId === '1' ? 78 : competitorId === '2' ? 89 : competitorId === '3' ? 91 : 82
        },

        // Tags and Products
        tags: competitorId === '1' 
          ? ['Enterprise', 'AI/ML', 'Cloud Platform', 'Market Leader']
          : competitorId === '2'
          ? ['Inbound Marketing', 'SMB Focused', 'Freemium', 'User-Friendly']
          : competitorId === '3'
          ? ['Visual Pipeline', 'SMB CRM', 'Affordable', 'European']
          : ['Customer Support', 'Ticketing', 'Multi-Channel', 'Scalable'],
        key_products: competitorId === '1'
          ? ['Sales Cloud', 'Service Cloud', 'Marketing Cloud', 'Einstein AI', 'Tableau', 'Slack Integration']
          : competitorId === '2'
          ? ['Marketing Hub', 'Sales Hub', 'Service Hub', 'CMS Hub', 'AI Content Assistant']
          : competitorId === '3'
          ? ['Sales CRM', 'Pipeline Management', 'Activity Tracking', 'Email Sync', 'Mobile App']
          : ['Support Suite', 'Guide', 'Chat', 'Talk', 'Explore', 'Answer Bot'],

        // AI Agents for this competitor
        agents: competitorId === '1' 
          ? [
              {
                id: 'sf-pricing-agent',
                name: 'Salesforce Pricing Monitor',
                type: 'pricing' as const,
                status: 'active' as const,
                lastRun: '2024-01-15T14:30:00Z',
                nextRun: '2024-01-15T18:30:00Z',
                frequency: 'Every 4 hours',
                insights: 23,
                description: 'Monitors pricing changes, new tiers, and promotional offers across all Salesforce products'
              },
              {
                id: 'sf-product-agent',
                name: 'Einstein AI Tracker',
                type: 'product' as const,
                status: 'active' as const,
                lastRun: '2024-01-15T12:00:00Z',
                nextRun: '2024-01-16T00:00:00Z',
                frequency: 'Daily',
                insights: 31,
                description: 'Tracks new features, updates, and announcements in Einstein AI and related products'
              },
              {
                id: 'sf-hiring-agent',
                name: 'Salesforce Talent Intelligence',
                type: 'hiring' as const,
                status: 'active' as const,
                lastRun: '2024-01-15T09:00:00Z',
                nextRun: '2024-01-16T09:00:00Z',
                frequency: 'Daily',
                insights: 12,
                description: 'Monitors key hires, team expansions, and strategic role postings'
              }
            ]
          : competitorId === '2'
          ? [
              {
                id: 'hs-product-agent',
                name: 'HubSpot AI Features Monitor',
                type: 'product' as const,
                status: 'active' as const,
                lastRun: '2024-01-15T13:15:00Z',
                nextRun: '2024-01-15T19:15:00Z',
                frequency: 'Every 6 hours',
                insights: 18,
                description: 'Tracks new AI features, integrations, and product updates across all HubSpot hubs'
              },
              {
                id: 'hs-marketing-agent',
                name: 'HubSpot Content Strategy Tracker',
                type: 'marketing' as const,
                status: 'active' as const,
                lastRun: '2024-01-15T11:30:00Z',
                nextRun: '2024-01-15T17:30:00Z',
                frequency: 'Every 6 hours',
                insights: 27,
                description: 'Monitors content marketing campaigns, webinars, and inbound strategy updates'
              },
              {
                id: 'hs-pricing-agent',
                name: 'HubSpot Pricing Intelligence',
                type: 'pricing' as const,
                status: 'paused' as const,
                lastRun: '2024-01-14T16:00:00Z',
                nextRun: '2024-01-16T08:00:00Z',
                frequency: 'Daily',
                insights: 8,
                description: 'Tracks pricing changes and promotional offers across all HubSpot tiers'
              }
            ]
          : competitorId === '3'
          ? [
              {
                id: 'pd-product-agent',
                name: 'Pipedrive Feature Monitor',
                type: 'product' as const,
                status: 'active' as const,
                lastRun: '2024-01-15T10:45:00Z',
                nextRun: '2024-01-15T22:45:00Z',
                frequency: 'Every 12 hours',
                insights: 14,
                description: 'Monitors new features, integrations, and mobile app updates'
              },
              {
                id: 'pd-marketing-agent',
                name: 'Pipedrive SMB Campaign Tracker',
                type: 'marketing' as const,
                status: 'active' as const,
                lastRun: '2024-01-15T08:20:00Z',
                nextRun: '2024-01-15T20:20:00Z',
                frequency: 'Every 12 hours',
                insights: 9,
                description: 'Tracks SMB-focused marketing campaigns and partnerships'
              }
            ]
          : [
              {
                id: 'zd-product-agent',
                name: 'Zendesk Suite Monitor',
                type: 'product' as const,
                status: 'active' as const,
                lastRun: '2024-01-15T07:30:00Z',
                nextRun: '2024-01-15T19:30:00Z',
                frequency: 'Every 12 hours',
                insights: 11,
                description: 'Tracks updates across Support, Guide, Chat, and new product launches'
              },
              {
                id: 'zd-hiring-agent',
                name: 'Zendesk Engineering Tracker',
                type: 'hiring' as const,
                status: 'error' as const,
                lastRun: '2024-01-14T12:00:00Z',
                nextRun: '2024-01-15T18:00:00Z',
                frequency: 'Daily',
                insights: 3,
                description: 'Monitors engineering hires and product team expansions'
              }
            ],

        executiveSummary: {
          content: competitorId === '1' 
            ? 'Salesforce dominates the CRM landscape with comprehensive cloud solutions serving 150,000+ companies globally. Their Einstein AI platform and extensive ecosystem create significant competitive moats, though complexity and pricing remain barriers for smaller organizations.'
            : competitorId === '2'
            ? 'HubSpot has revolutionized inbound marketing with integrated CRM, marketing, and sales tools. Their freemium model and user-friendly approach drive strong SMB adoption, with recent AI investments challenging our market position.'
            : competitorId === '3'
            ? 'Pipedrive excels in visual sales pipeline management for SMBs with intuitive design and competitive pricing. Strong European presence and high user satisfaction make them a formidable competitor in our target market segments.'
            : 'Zendesk leads customer service software with comprehensive support solutions. While primarily focused on support rather than sales intelligence, their platform expansion and AI initiatives present adjacent competitive threats.',
          confidence: 94,
          lastGenerated: '2024-01-15T10:30:00Z',
          sources: ['Company reports', 'Market analysis', 'User reviews', 'Industry research'],
          isManuallyEdited: false
        },

        businessModel: {
          content: competitorId === '1'
            ? 'Multi-cloud SaaS platform with land-and-expand strategy. Primary revenue from subscriptions ($26.5B) with high-value enterprise contracts. Strong ecosystem monetization through AppExchange and professional services.'
            : competitorId === '2' 
            ? 'Freemium-to-premium model across Marketing, Sales, Service, and CMS hubs. Viral growth through free tier drives customer acquisition with premium conversion rates around 15-20%. Average customer value growing 18% YoY.'
            : competitorId === '3'
            ? 'Simple subscription model ($14.90-$99/user/month) targeting sales teams. High retention (94%) in SMB segment with focus on ease of use and quick value realization. Strong European market presence.'
            : 'Multi-product strategy with Support Suite as core offering. Expansion revenue through additional products and seat growth. Average customer spends ~$8K annually with 95%+ enterprise retention.',
          confidence: 91,
          lastGenerated: '2024-01-15T09:15:00Z',
          sources: ['Financial reports', 'Investor presentations', 'Pricing analysis'],
          isManuallyEdited: false
        },

        marketPositioning: {
          content: competitorId === '1'
            ? 'Positioned as complete Customer 360 platform for enterprise. "AI for Everyone" messaging with Einstein. Dominates large enterprise but expensive for SMB. Strong partner ecosystem drives adoption.'
            : competitorId === '2'
            ? 'Champions inbound methodology with "grow better" philosophy. Targets marketing-sales alignment in SMB/mid-market. Content marketing and freemium model drive organic growth and brand advocacy.'
            : competitorId === '3'
            ? 'Focuses on "CRM for salespeople" with visual pipeline emphasis. Targets SMB sales teams wanting simplicity over complexity. Strong word-of-mouth and user satisfaction drive growth.'
            : 'Leads customer service space with "easy-to-use" positioning. Targets support teams across SMB to enterprise. Recent expansion into sales tools broadens competitive overlap.',
          confidence: 88,
          lastGenerated: '2024-01-14T14:45:00Z',
          sources: ['Marketing materials', 'Competitive analysis', 'Conference content'],
          isManuallyEdited: false
        },

        productIntelligence: {
          overview: {
            content: competitorId === '1'
              ? 'Comprehensive platform with 15+ clouds including Sales, Marketing, Service, Commerce. Einstein AI embedded across products. Recent Slack integration and Tableau analytics enhance offering.'
              : competitorId === '2'
              ? 'Integrated platform with Marketing Hub, Sales Hub, Service Hub, and CMS Hub. AI features include content assistant and conversation intelligence. Strong ecosystem with 1,000+ integrations.'
              : competitorId === '3'
              ? 'Focused sales CRM with visual pipeline management. Core features include deal tracking, activity management, and reporting. Recent AI assistant and mobile app improvements.'
              : 'Customer service platform with Support, Guide, Talk, and Explore products. Recent expansion into Sell CRM. AI features include Answer Bot and sentiment analysis.',
            confidence: 92,
            lastGenerated: '2024-01-15T08:20:00Z',
            sources: ['Product demos', 'Feature analysis', 'User feedback'],
            isManuallyEdited: false
          },
          keyFeatures: [
            {
              name: 'AI-Powered Analytics',
              description: 'Advanced AI and machine learning for predictive insights and automation',
              ourSupport: 'full',
              theirSupport: competitorId === '1' || competitorId === '2' ? 'full' : 'partial',
              advantage: competitorId === '1' ? 'them' : 'neutral'
            },
            {
              name: 'Pipeline Management',
              description: 'Visual deal tracking and sales process optimization',
              ourSupport: 'full',
              theirSupport: 'full',
              advantage: competitorId === '3' ? 'them' : 'neutral'
            },
            {
              name: 'Marketing Automation',
              description: 'Email campaigns, lead nurturing, and conversion tracking',
              ourSupport: 'partial',
              theirSupport: competitorId === '2' ? 'full' : 'partial',
              advantage: competitorId === '2' ? 'them' : 'neutral'
            }
          ],
          pricingStrategy: {
            content: competitorId === '1'
              ? 'Premium pricing model with enterprise focus. Essentials ($25/user/month) to Unlimited ($300+). High total cost of ownership with add-ons and customization.'
              : competitorId === '2'
              ? 'Freemium model with tiered pricing. Free CRM to Enterprise ($3,200/month). Pricing scales with contacts and features. Strong value proposition in SMB segment.'
              : competitorId === '3'
              ? 'Transparent, competitive pricing ($14.90-$99/user/month). No setup fees or long-term contracts. Strong value in SMB market with clear feature differentiation.'
              : 'Tiered pricing from $55-$215/agent/month. Additional products priced separately. Recent 15-20% price increases across most plans.',
            confidence: 89,
            lastGenerated: '2024-01-15T11:00:00Z',
            sources: ['Pricing pages', 'Sales intelligence', 'Customer feedback'],
            isManuallyEdited: false
          },
          integrations: {
            content: competitorId === '1'
              ? 'AppExchange marketplace with 5,000+ applications. Native integrations with Google, Microsoft, Slack. MuleSoft provides enterprise connectivity.'
              : competitorId === '2'
              ? 'App Marketplace with 1,000+ integrations. Native connections to Salesforce, Gmail, Shopify. Strong Zapier integration for workflow automation.'
              : competitorId === '3'
              ? '350+ marketplace integrations including Slack, Trello, Mailchimp. Zapier support provides access to 3,000+ additional apps.'
              : 'Marketplace with 1,000+ apps focused on customer service. Strong integrations with Salesforce, JIRA, Slack for enterprise workflows.',
            confidence: 86,
            lastGenerated: '2024-01-14T16:30:00Z',
            sources: ['Integration marketplaces', 'API documentation', 'User reviews'],
            isManuallyEdited: false
          }
        },

        swotAnalysis: {
          strengths: competitorId === '1' 
            ? [
                'Market leading position with 23% CRM market share',
                'Comprehensive platform covering entire customer lifecycle',
                'Strong AI capabilities with Einstein across all products',
                'Extensive partner and developer ecosystem'
              ]
            : competitorId === '2'
            ? [
                'Leading inbound marketing methodology and education',
                'User-friendly interface with quick time-to-value', 
                'Successful freemium model driving acquisition',
                'Strong content marketing and thought leadership'
              ]
            : competitorId === '3'
            ? [
                'Intuitive visual pipeline interface',
                'Competitive pricing for SMB market',
                'High customer satisfaction (4.5+ stars)',
                'Strong European market presence'
              ]
            : [
                'Dominant customer service software position',
                'Scalable platform for all business sizes',
                'Strong brand recognition and loyalty',
                'Comprehensive multi-channel support'
              ],
          weaknesses: competitorId === '1'
            ? [
                'High complexity and steep learning curve',
                'Expensive pricing limits SMB adoption',
                'Over-engineering for simple use cases',
                'Heavy dependence on partner ecosystem'
              ]
            : competitorId === '2'
            ? [
                'Pricing becomes expensive with contact growth',
                'Limited enterprise features vs specialized competitors',
                'Smaller professional services organization',
                'Marketing focus may limit pure sales appeal'
              ]
            : competitorId === '3'
            ? [
                'Limited marketing automation features',
                'Smaller company size concerns for enterprise',
                'Basic reporting vs enterprise solutions',
                'Less extensive integration ecosystem'
              ]
            : [
                'Limited sales-focused features',
                'Expensive for large support organizations',
                'Less marketing automation capabilities',
                'Recent price increases driving churn'
              ],
          opportunities: competitorId === '1'
            ? [
                'AI-powered automation market growth',
                'International market expansion',
                'Industry-specific cloud development',
                'Small business market penetration'
              ]
            : competitorId === '2'
            ? [
                'Enterprise market expansion',
                'International growth opportunities',
                'E-commerce platform integration',
                'AI and machine learning advancement'
              ]
            : competitorId === '3'
            ? [
                'North American market expansion',
                'Enterprise feature development',
                'Marketing automation platform',
                'AI and analytics enhancement'
              ]
            : [
                'Sales automation feature development',
                'AI integration across platform',
                'Adjacent market expansion',
                'SMB market penetration'
              ],
          threats: competitorId === '1'
            ? [
                'Microsoft Dynamics 365 integration threat',
                'Economic downturn affecting enterprise spending',
                'New AI-focused competitors',
                'Regulatory data privacy changes'
              ]
            : competitorId === '2'
            ? [
                'Enterprise competitors expanding to SMB',
                'Economic pressure on SMB tech spending',
                'Rising customer acquisition costs',
                'Major platform integration (Microsoft, Google)'
              ]
            : competitorId === '3'
            ? [
                'Large competitors with competitive SMB pricing',
                'Economic downturn affecting SMB customers',
                'Feature expectations increasing',
                'Potential acquisition by larger players'
              ]
            : [
                'Specialized customer service platforms',
                'Integrated business platforms threat',
                'AI-first competitor emergence',
                'Open-source solution adoption'
              ],
          lastUpdated: '2024-01-15T12:00:00Z'
        },

        competitiveIntelligence: [
          {
            id: 'intel-1',
            type: 'pricing',
            title: 'Pricing Strategy Update Announced',
            description: competitorId === '1' ? 'Enterprise tier pricing increased 15% with Einstein AI features included' : competitorId === '2' ? 'New Professional tier introduced at $800/month between Starter and Enterprise' : competitorId === '3' ? 'Enterprise tier launched at $99/user/month with advanced features' : '18% price increase across Support Suite plans',
            impact: 'high',
            timestamp: '2024-01-15T08:30:00Z',
            source: 'Company announcement',
            confidence: 94
          },
          {
            id: 'intel-2',
            type: 'product',
            title: 'AI Feature Release',
            description: competitorId === '1' ? 'Einstein GPT integration provides automated content generation and deal insights' : competitorId === '2' ? 'AI Content Assistant launched for automated blog posts and email content' : competitorId === '3' ? 'AI Sales Assistant provides lead scoring and next-best-action recommendations' : 'Advanced AI for ticket routing and sentiment analysis with 95% accuracy',
            impact: 'high',
            timestamp: '2024-01-14T15:45:00Z',
            source: 'Product announcement',
            confidence: 91
          }
        ],

        // Enhanced activity feed with expandable content
        activityFeed: [
          {
            id: 'activity-1',
            type: 'ai_insight',
            title: 'Competitive Threat Level Increased',
            description: 'AI analysis indicates increased competitive pressure due to recent product launches and pricing changes.',
            timestamp: '2024-01-15T14:30:00Z',
            importance: 'high',
            category: 'Market Analysis',
            actionRequired: true,
            expandedContent: {
              summary: 'Our AI analysis has detected significant competitive movements that warrant immediate attention.',
              keyFindings: [
                'New AI-powered features launched directly competing with our core offering',
                'Aggressive pricing strategy targeting our key customer segments', 
                'Increased marketing spend in our primary channels (+45% QoQ)',
                'Strategic partnerships announced with major enterprise clients'
              ],
              impact: 'This combination of product enhancement and market expansion could result in 10-15% market share loss in Q2 if left unaddressed.',
              recommendations: [
                'Accelerate our AI feature roadmap by 2 months',
                'Launch competitive pricing response within 30 days',
                'Increase customer retention efforts for at-risk accounts',
                'Consider strategic partnership opportunities'
              ],
              confidence: 89,
              sources: ['Product announcements', 'Pricing intelligence', 'Ad spend analysis', 'Partnership databases']
            }
          },
          {
            id: 'activity-2', 
            type: 'product_update',
            title: 'New AI Features Launched',
            description: 'Competitor released advanced AI capabilities that directly compete with our core value proposition.',
            timestamp: '2024-01-15T10:15:00Z',
            importance: 'high',
            category: 'Product Intelligence',
            expandedContent: {
              summary: 'Major product release introduces advanced AI capabilities across multiple product lines.',
              keyFindings: [
                'GPT-4 integration for automated content generation',
                'Predictive analytics dashboard with 95% accuracy claims',
                'Natural language query interface for non-technical users',
                'Real-time competitive pricing optimization'
              ],
              impact: 'These features address key customer pain points and may accelerate customer acquisition in the SMB segment.',
              technicalDetails: {
                'AI Models': 'GPT-4, proprietary ML models for forecasting',
                'Integration': 'REST APIs, Zapier, native mobile apps',
                'Performance': 'Sub-500ms response times, 99.9% uptime SLA',
                'Pricing': 'Included in Professional tier ($89/month)'
              },
              recommendations: [
                'Evaluate our AI roadmap against these new capabilities',
                'Survey customers about interest in similar features',
                'Assess technical feasibility for rapid deployment',
                'Monitor customer churn in affected segments'
              ],
              confidence: 94
            }
          },
          {
            id: 'activity-3',
            type: 'competitive_action',
            title: 'Market Expansion Initiative',
            description: 'Aggressive SMB market penetration campaign launched with competitive pricing and migration incentives.',
            timestamp: '2024-01-14T16:20:00Z',
            importance: 'medium',
            category: 'Market Strategy',
            expandedContent: {
              summary: 'Comprehensive market expansion strategy targeting SMB segment with pricing and migration incentives.',
              campaignDetails: {
                'Target Market': 'SMB companies (50-500 employees)',
                'Pricing Strategy': '30% discount for first year, free migration',
                'Marketing Channels': 'Digital ads, content marketing, partner referrals',
                'Budget Allocation': 'Estimated $2.3M across 6 months'
              },
              keyFindings: [
                'Free migration services with dedicated support team',
                'SMB-specific feature package at competitive pricing',
                'Partnership with accounting firms and consultants',
                'Webinar series targeting SMB pain points'
              ],
              impact: 'Could capture 5-8% additional SMB market share over next two quarters.',
              recommendations: [
                'Launch our own SMB-focused campaign',
                'Enhance our migration tools and support',
                'Partner with similar professional service firms',
                'Develop SMB-specific case studies and content'
              ],
              confidence: 82
            }
          },
          {
            id: 'activity-4',
            type: 'customer_feedback',
            title: 'User Satisfaction Trend',
            description: 'Customer satisfaction scores trending upward (+12% QoQ) based on recent feature releases.',
            timestamp: '2024-01-14T09:45:00Z',
            importance: 'medium',
            category: 'Customer Intelligence',
            expandedContent: {
              summary: 'Positive customer satisfaction trends driven by recent product improvements and support enhancements.',
              metrics: {
                'Overall Satisfaction': '4.6/5 (+12% QoQ)',
                'Feature Satisfaction': '4.4/5 (+18% QoQ)', 
                'Support Rating': '4.7/5 (+8% QoQ)',
                'NPS Score': '67 (+15 points)'
              },
              topPositiveFeedback: [
                'New dashboard interface is much more intuitive',
                'AI features save significant time on analysis',
                'Customer support response times improved dramatically',
                'Mobile app performance is excellent'
              ],
              remainingConcerns: [
                'Pricing still considered high for smaller businesses',
                'Some advanced features have steep learning curve',
                'Integration with legacy systems needs improvement'
              ],
              impact: 'Higher retention rates likely in upcoming renewals with positive word-of-mouth driving organic growth.',
              implications: [
                'Higher retention rates likely in upcoming renewals',
                'Positive word-of-mouth may drive organic growth',
                'Opportunity to increase customer lifetime value',
                'Competitive advantage in customer satisfaction'
              ],
              confidence: 91
            }
          },
          {
            id: 'activity-5',
            type: 'ai_insight',
            title: 'Pricing Strategy Analysis',
            description: 'AI detected potential pricing vulnerability in enterprise segment.',
            timestamp: '2024-01-13T11:30:00Z',
            importance: 'medium',
            category: 'Pricing Intelligence',
            expandedContent: {
              summary: 'Analysis reveals potential pricing gaps that competitor may exploit in enterprise deals.',
              findings: [
                'Our enterprise pricing 15-20% higher than market average',
                'Competitor offering similar feature set at lower price point',
                'Enterprise buyers increasingly price-sensitive',
                'Volume discount structure less competitive'
              ],
              impact: 'Medium risk of losing 2-3 major enterprise deals in Q1 due to pricing pressure.',
              riskAssessment: 'Medium risk of losing 2-3 major enterprise deals in Q1 due to pricing pressure.',
              recommendations: [
                'Review enterprise pricing strategy',
                'Enhance volume discount tiers',
                'Bundle additional services to justify premium',
                'Create competitive response pricing framework'
              ],
              confidence: 76
            }
          },
          {
            id: 'activity-6',
            type: 'product_update', 
            title: 'API Performance Improvements',
            description: 'Major infrastructure upgrade announced with 3x performance improvements.',
            timestamp: '2024-01-12T15:20:00Z',
            importance: 'low',
            category: 'Technical Intelligence',
            expandedContent: {
              summary: 'Significant infrastructure investment focuses on API performance and scalability.',
              improvements: [
                'API response times reduced by 65%',
                'Uptime improved to 99.99% SLA',
                'New CDN implementation for global performance',
                'Enhanced rate limiting and security measures'
              ],
              impact: 'Better technical performance may reduce customer churn and improve developer adoption.',
              recommendations: [
                'Benchmark our API performance against these improvements',
                'Consider similar infrastructure investments',
                'Update our technical marketing materials',
                'Engage with customers about performance requirements'
              ],
              confidence: 88
            }
          }
        ]
      };

      setCompetitor(mockProfile);
    } catch (error) {
      console.error('Error fetching competitor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 80) return 'text-blue-600 bg-blue-100 border-blue-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ai_insight': return Bot;
      case 'product_update': return Package;
      case 'market_movement': return TrendingUp;
      case 'competitive_action': return Target;
      case 'customer_feedback': return MessageSquare;
      default: return Activity;
    }
  };

  const getActivityColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const getFilteredActivities = () => {
    return competitor.activityFeed.filter(activity => 
      feedFilter === 'all' || activity.type === feedFilter
    );
  };

  const getPaginatedActivities = () => {
    const filtered = getFilteredActivities();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredActivities().length / itemsPerPage);
  };

  // Edit form helper functions
  const addItem = (field: 'key_products' | 'strengths' | 'weaknesses', value: string) => {
    if (value.trim()) {
      setEditForm(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeItem = (field: 'key_products' | 'strengths' | 'weaknesses', index: number) => {
    setEditForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateItem = (field: 'key_products' | 'strengths' | 'weaknesses', index: number, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const saveChanges = async () => {
    try {
      // In a real app, this would make an API call
      if (competitor) {
        setCompetitor(prev => prev ? {
          ...prev,
          key_products: editForm.key_products,
          swotAnalysis: {
            ...prev.swotAnalysis,
            strengths: editForm.strengths,
            weaknesses: editForm.weaknesses
          }
        } : null);
        setIsEditing(false);
        // Show success message (you could add a toast notification here)
        console.log('Competitor profile updated successfully');
      }
    } catch (error) {
      console.error('Failed to save changes:', error);
      // Show error message (you could add a toast notification here)
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'pricing': return DollarSign;
      case 'product': return Package;
      case 'marketing': return TrendingUp;
      case 'hiring': return Users;
      case 'social': return MessageSquare;
      case 'news': return FileText;
      default: return Activity;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading competitor profile...</p>
        </div>
      </div>
    );
  }

  if (!competitor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Competitor not found</h2>
          <p className="text-gray-800 mb-4">The competitor profile you're looking for doesn't exist.</p>
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg text-gray-800 hover:text-indigo-600 hover:bg-gray-100 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <button 
                onClick={() => router.push('/competitor-intelligence')}
                className="hover:text-indigo-600 transition-colors"
              >
                Competitor Intelligence
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{competitor.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Main Header */}
          <div className="mb-8">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 sm:p-8">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-6 sm:space-y-0 sm:space-x-6">
                  <div className="flex items-center justify-center sm:justify-start">
                    {competitor.logo && competitor.logo.startsWith('http') ? (
                      <img 
                        src={competitor.logo} 
                        alt={`${competitor.name} logo`}
                        className="max-w-24 max-h-16 w-auto h-auto object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<div class="w-16 h-16 flex items-center justify-center rounded-xl bg-gray-100"><span class="text-2xl font-bold text-gray-700">${competitor.name.charAt(0)}</span></div>`;
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gray-100">
                        <span className="text-2xl font-bold text-gray-700">{competitor.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{competitor.name}</h1>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
                      <span className="text-gray-800 text-base font-medium">{competitor.industry}</span>
                      <span className="text-gray-400">•</span>
                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${getThreatColor(competitor.threat_level)}`}>
                        {competitor.threat_level.toUpperCase()} THREAT
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={() => window.open(`https://${competitor.website}`, '_blank')}
                      className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-gray-900 hover:scale-105"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Visit Site</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl">
                      <Bot className="w-4 h-4" />
                      <span>Generate Report</span>
                    </button>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-6">
                  <p className="text-gray-700 leading-relaxed">
                    {competitor.executiveSummary.content}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-2">
              <div className="flex space-x-1 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview', icon: Eye },
                  { id: 'features', label: 'Feature Comparison', icon: BarChart3 },
                  { id: 'pricing', label: 'Pricing Strategy', icon: DollarSign },
                  { id: 'integrations', label: 'Integrations', icon: Zap },
                  { id: 'insights', label: 'Intelligence Reports', icon: Lightbulb },
                  { id: 'feed', label: 'Activity Feed', icon: Activity }
                ].map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                        activeSection === section.id
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{section.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Overview Section */}
              {activeSection === 'overview' && (
                <>
                  {/* Intelligence Feed */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Intelligence Feed</h2>
                      <p className="text-sm text-gray-600">Latest insights and updates</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <select
                      value={feedFilter}
                      onChange={(e) => setFeedFilter(e.target.value as any)}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 bg-white"
                    >
                      <option value="all">All Updates</option>
                      <option value="ai_insight">AI Insights</option>
                      <option value="product_update">Product Updates</option>
                      <option value="competitive_action">Competitive Actions</option>
                    </select>
                    <button className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                      <Plus className="w-4 h-4" />
                      <span>Add Update</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {getPaginatedActivities().map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    const isExpanded = expandedItems.has(activity.id);
                    
                    return (
                      <div key={activity.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Icon className="w-4 h-4 text-indigo-600" />
                              <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                activity.importance === 'high' ? 'bg-red-100 text-red-800' :
                                activity.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {activity.importance.toUpperCase()}
                              </span>
                              <span className="px-2 py-1 text-xs rounded border bg-gray-50 text-gray-700">{activity.category}</span>
                            </div>
                            <p className="text-gray-700 mb-3">{activity.description}</p>
                            
                            {/* Expanded Content */}
                            {isExpanded && activity.expandedContent && (
                              <div className="mt-4 border-t border-gray-100 pt-4 space-y-4">
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                                  <p className="text-gray-700 text-sm">{activity.expandedContent.summary}</p>
                                </div>
                                
                                {activity.expandedContent.keyFindings && (
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Key Findings</h4>
                                    <ul className="space-y-1">
                                      {activity.expandedContent.keyFindings.map((finding, index) => (
                                        <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                                          <span>{finding}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {activity.expandedContent.findings && (
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Findings</h4>
                                    <ul className="space-y-1">
                                      {activity.expandedContent.findings.map((finding, index) => (
                                        <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                                          <span>{finding}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {activity.expandedContent.metrics && (
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Metrics</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                      {Object.entries(activity.expandedContent.metrics).map(([key, value]) => (
                                        <div key={key} className="bg-gray-50 rounded-lg p-3">
                                          <div className="text-xs font-medium text-gray-600">{key}</div>
                                          <div className="text-sm font-semibold text-gray-900">{value}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Impact</h4>
                                  <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">{activity.expandedContent.impact}</p>
                                </div>
                                
                                {activity.expandedContent.recommendations && (
                                  <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                                    <ul className="space-y-1">
                                      {activity.expandedContent.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                          <span>{rec}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span>Confidence: {activity.expandedContent.confidence}%</span>
                                    {activity.expandedContent.sources && (
                                      <span>Sources: {activity.expandedContent.sources.length}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                                {activity.actionRequired && (
                                  <>
                                    <span>•</span>
                                    <span className="text-red-600 font-medium">Action Required</span>
                                  </>
                                )}
                              </div>
                              {activity.expandedContent && (
                                <button
                                  onClick={() => toggleExpanded(activity.id)}
                                  className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                                >
                                  <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
                                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Pagination */}
                  {getTotalPages() > 1 && (
                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, getFilteredActivities().length)} to {Math.min(currentPage * itemsPerPage, getFilteredActivities().length)} of {getFilteredActivities().length} reports
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        
                        <div className="flex space-x-1">
                          {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                currentPage === page
                                  ? 'bg-indigo-600 text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(getTotalPages(), prev + 1))}
                          disabled={currentPage === getTotalPages()}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Competitive Analysis */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <GitCompare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Competitive Analysis</h2>
                    <p className="text-sm text-gray-600">Strategic insights and SWOT analysis</p>
                  </div>
                </div>

                {/* Quick Comparison Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="text-2xl font-bold text-blue-900">{competitor.overallScore}</div>
                    <div className="text-sm text-blue-700">Overall Score</div>
                    <div className="text-xs text-blue-600 mt-1">vs Our 87</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <div className="text-2xl font-bold text-green-900">{competitor.marketShare}%</div>
                    <div className="text-sm text-green-700">Market Share</div>
                    <div className="text-xs text-green-600 mt-1">vs Our 12.8%</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-100">
                    <div className="text-2xl font-bold text-amber-900">{competitor.userReviews.averageRating}</div>
                    <div className="text-sm text-amber-700">User Rating</div>
                    <div className="text-xs text-amber-600 mt-1">vs Our 4.3</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                    <div className="text-2xl font-bold text-purple-900">{competitor.growthRate}%</div>
                    <div className="text-sm text-purple-700">Growth Rate</div>
                    <div className="text-xs text-purple-600 mt-1">vs Our 28%</div>
                  </div>
                </div>

                {/* SWOT Analysis Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Strengths & Opportunities */}
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-green-900">Strengths</h3>
                      </div>
                      <div className="space-y-2">
                        {competitor.swotAnalysis.strengths.slice(0, 3).map((strength, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-sm text-green-800">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                      <div className="flex items-center space-x-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">Opportunities</h3>
                      </div>
                      <div className="space-y-2">
                        {competitor.swotAnalysis.opportunities.slice(0, 3).map((opportunity, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-sm text-blue-800">{opportunity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Weaknesses & Threats */}
                  <div className="space-y-4">
                    <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                      <div className="flex items-center space-x-2 mb-3">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <h3 className="font-semibold text-red-900">Weaknesses</h3>
                      </div>
                      <div className="space-y-2">
                        {competitor.swotAnalysis.weaknesses.slice(0, 3).map((weakness, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-sm text-red-800">{weakness}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <h3 className="font-semibold text-amber-900">Threats</h3>
                      </div>
                      <div className="space-y-2">
                        {competitor.swotAnalysis.threats.slice(0, 3).map((threat, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-sm text-amber-800">{threat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Competitive Comparison */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <GitCompare className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Head-to-Head Comparison</h2>
                    <p className="text-sm text-gray-600">Detailed competitive analysis across key areas</p>
                  </div>
                </div>

                {/* T-Chart Style Comparison */}
                <div className="space-y-8">
                  {/* Key Products & Services */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <span>Key Products & Services</span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2">
                          <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                          <span>Our Platform</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {['Customer Intelligence AI', 'Competitive Analysis', 'Sales Insights Platform', 'Marketing Analytics', 'Automation Workflows', 'Integration Hub'].map((product, index) => (
                            <div key={index} className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-blue-100">
                              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900">{product}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                          <span className="w-3 h-3 bg-gray-600 rounded-full"></span>
                          <span>{competitor.name}</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {competitor.key_products.map((product, index) => (
                            <div key={index} className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-100">
                              <Package className="w-4 h-4 text-gray-600 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900">{product}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Competitive Strengths */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Competitive Strengths</span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-4 flex items-center space-x-2">
                          <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                          <span>Our Advantages</span>
                        </h4>
                        <div className="space-y-3">
                          {['AI-powered customer intelligence with 95% accuracy', 'Real-time competitive monitoring across 500+ sources', 'Advanced automation workflows with custom triggers', 'Seamless CRM integration with major platforms'].map((strength, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-green-100">
                              <ThumbsUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-900">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                          <span className="w-3 h-3 bg-gray-600 rounded-full"></span>
                          <span>{competitor.name} Advantages</span>
                        </h4>
                        <div className="space-y-3">
                          {competitor.swotAnalysis.strengths.map((strength, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-100">
                              <Star className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-900">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Competitive Weaknesses */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span>Areas for Exploitation</span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                        <h4 className="font-semibold text-red-900 mb-4 flex items-center space-x-2">
                          <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                          <span>Our Challenges</span>
                        </h4>
                        <div className="space-y-3">
                          {['Newer brand with less market recognition', 'Smaller integration marketplace (250 vs competitors)', 'Limited enterprise sales team compared to large vendors', 'Developing mobile app functionality'].map((weakness, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-red-100">
                              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-900">{weakness}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                        <h4 className="font-semibold text-amber-900 mb-4 flex items-center space-x-2">
                          <span className="w-3 h-3 bg-amber-600 rounded-full"></span>
                          <span>{competitor.name} Vulnerabilities</span>
                        </h4>
                        <div className="space-y-3">
                          {competitor.swotAnalysis.weaknesses.map((weakness, index) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-amber-100">
                              <Target className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-900">{weakness}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                </>
              )}

              {/* Features Section */}
              {activeSection === 'features' && (
                <>
                  {/* Enhanced Feature Comparison Section */}
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900">Feature Comparison</h2>
                          <p className="text-gray-600 mt-1">Comprehensive analysis of feature capabilities</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search features..."
                            value={featureSearchQuery}
                            onChange={(e) => setFeatureSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <select
                          value={selectedFeatureCategory}
                          onChange={(e) => setSelectedFeatureCategory(e.target.value as any)}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                        >
                          <option value="all">All Categories</option>
                          <option value="core">Core Platform</option>
                          <option value="integration">Integration</option>
                          <option value="security">Security</option>
                          <option value="pricing">Pricing</option>
                        </select>
                        <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                          Export Comparison
                        </button>
                      </div>
                    </div>

                    {/* AI Feature Assistant */}
                    {featureSearchQuery && (
                      <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-start space-x-3">
                          <Bot className="w-5 h-5 text-purple-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-purple-900 mb-2">AI Feature Analysis</h4>
                            <p className="text-purple-800 text-sm">
                              Based on your search for "{featureSearchQuery}", here's how this feature typically works:
                            </p>
                            <div className="mt-3 p-3 bg-white/50 rounded-lg">
                              <p className="text-sm text-purple-700">
                                This feature enables advanced functionality with seamless integration capabilities. 
                                Our platform provides comprehensive support with enhanced customization options.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Professional Feature Comparison Table */}
                  <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                        <h3 className="text-2xl font-bold text-gray-900">Feature Comparison</h3>
                      </div>
                      <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                        Export Comparison
                      </button>
                    </div>

                    {/* Comparison Table Header */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <h4 className="text-lg font-bold text-gray-900">Features</h4>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                        <h4 className="text-lg font-bold text-blue-900">Our Platform</h4>
                        <p className="text-sm text-blue-700 mt-1">AI-First Intelligence</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                        <h4 className="text-lg font-bold text-gray-900">{competitor.name}</h4>
                        <p className="text-sm text-gray-700 mt-1">{competitor.category}</p>
                      </div>
                    </div>

                    {/* Feature Categories */}
                    <div className="space-y-8">
                      {/* Core Platform Features */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                          <Package className="w-5 h-5 text-blue-600" />
                          <span>Core Platform Features</span>
                        </h4>
                        
                        <div className="space-y-3">
                          {/* AI & Intelligence */}
                          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                            <div className="font-medium text-gray-900 flex items-center">
                              <span>AI-Powered Insights</span>
                              <div className="ml-2 group relative">
                                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                                <div className="invisible group-hover:visible absolute z-10 w-48 p-2 bg-black text-white text-xs rounded-lg -top-8 left-4">
                                  Automated analysis and recommendations
                                </div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Advanced
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {competitorId === '1' ? 'Einstein AI' : 'Basic'}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                            <div className="font-medium text-gray-900">Competitive Intelligence</div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Native
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                <X className="w-4 h-4 mr-1" />
                                Limited
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                            <div className="font-medium text-gray-900">Meeting Intelligence</div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Full Transcription
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                                <Minus className="w-4 h-4 mr-1" />
                                {competitorId === '1' ? 'Basic Recording' : 'Via Add-ons'}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                            <div className="font-medium text-gray-900">Real-time Alerts</div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Multi-channel
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Email Only
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Integration & Connectivity */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                          <Zap className="w-5 h-5 text-indigo-600" />
                          <span>Integration & Connectivity</span>
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                            <div className="font-medium text-gray-900">HubSpot Integration</div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Deep Native
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {competitorId === '1' ? 'Competitor' : 'Third-party'}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                            <div className="font-medium text-gray-900">JIRA Integration</div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Native
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                <X className="w-4 h-4 mr-1" />
                                Not Available
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                            <div className="font-medium text-gray-900">API Access</div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                REST + Webhooks
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {competitorId === '1' ? 'Comprehensive' : 'REST Only'}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                            <div className="font-medium text-gray-900">Third-party Apps</div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                                <Zap className="w-4 h-4 mr-1" />
                                20+
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <Zap className="w-4 h-4 mr-1" />
                                {competitorId === '1' ? '1,000+' : '500+'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Value */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                          <DollarSign className="w-5 h-5 text-purple-600" />
                          <span>Pricing & Value</span>
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                            <div className="font-medium text-gray-900">Starting Price</div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-700">$49<span className="text-sm font-normal">/user/mo</span></div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-700">
                                {competitorId === '1' ? '$80' : competitorId === '2' ? '$50' : '$14'}
                                <span className="text-sm font-normal">
                                  {competitorId === '2' ? '/mo' : '/user/mo'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                            <div className="font-medium text-gray-900">Enterprise Pricing</div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-700">$199<span className="text-sm font-normal">/user/mo</span></div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-700">
                                {competitorId === '1' ? '$165' : competitorId === '2' ? '$3,200' : '$99'}
                                <span className="text-sm font-normal">
                                  {competitorId === '2' ? '/mo' : '/user/mo'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                            <div className="font-medium text-gray-900">Free Trial</div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                14 Days
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {competitorId === '1' ? '30 Days' : competitorId === '2' ? 'Forever Free' : '14 Days'}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                            <div className="font-medium text-gray-900">Contract Terms</div>
                            <div className="text-center">
                              <div className="text-sm text-purple-700 font-medium">Monthly/Annual</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-700 font-medium">
                                {competitorId === '1' ? 'Annual Required' : 'Monthly/Annual'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enterprise & Security */}
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          <span>Enterprise & Security</span>
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                            <div className="font-medium text-gray-900">SOC 2 Compliance</div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Type II
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {competitorId === '1' ? 'Type II' : 'Type I'}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                            <div className="font-medium text-gray-900">Single Sign-On (SSO)</div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                SAML/OAuth
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Enterprise Only
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                            <div className="font-medium text-gray-900">Data Residency</div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                                <Minus className="w-4 h-4 mr-1" />
                                US/EU
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                {competitorId === '1' ? 'Global' : 'US/EU'}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                            <div className="font-medium text-gray-900">Support Level</div>
                            <div className="text-center">
                              <div className="text-sm text-purple-700 font-medium">24/7 Chat + Phone</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-700 font-medium">
                                {competitorId === '1' ? '24/7 Premium' : 'Business Hours'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Competitive Advantage Summary */}
                      <div className="border-t border-gray-200 pt-6">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            <span>Competitive Advantage Summary</span>
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h5 className="font-semibold text-blue-900 mb-3">Where We Excel</h5>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-sm text-gray-700">Native competitive intelligence</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-sm text-gray-700">Deep HubSpot & JIRA integration</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-sm text-gray-700">AI-first meeting intelligence</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span className="text-sm text-gray-700">Transparent, flexible pricing</span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="font-semibold text-red-900 mb-3">Growth Opportunities</h5>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  <span className="text-sm text-gray-700">Expand third-party app ecosystem</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  <span className="text-sm text-gray-700">Enterprise-scale deployment history</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  <span className="text-sm text-gray-700">Global data residency options</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  <span className="text-sm text-gray-700">Brand recognition in established markets</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Pricing Section */}
              {activeSection === 'pricing' && (
                <>
                  {/* Enhanced Pricing & Packaging Section */}
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-6 h-6 text-green-600" />
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900">Pricing Strategy</h2>
                          <p className="text-gray-600 mt-1">Comprehensive pricing analysis and comparison</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <select
                          value={pricingViewMode}
                          onChange={(e) => setPricingViewMode(e.target.value as any)}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                        >
                          <option value="comparison">Side-by-Side</option>
                          <option value="calculator">ROI Calculator</option>
                          <option value="trends">Market Trends</option>
                        </select>
                        <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                          Export Analysis
                        </button>
                      </div>
                    </div>

                    {/* Pricing View Modes */}
                    {pricingViewMode === 'calculator' && (
                      <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-4">ROI Calculator</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
                            <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="10" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contract Length</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                              <option>12 months</option>
                              <option>24 months</option>
                              <option>36 months</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Savings</label>
                            <div className="px-3 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">$24,000/year</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {pricingViewMode === 'trends' && (
                      <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-4">Market Pricing Trends</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Industry Average</h5>
                            <p className="text-sm text-gray-600">$75/user/month for similar platforms</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Price Trend</h5>
                            <p className="text-sm text-gray-600">↗️ 12% increase over past year</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Pricing & Packaging */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span>Pricing & Packaging Strategy</span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-4">Our Pricing Strategy</h4>
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4 border border-green-100">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-900">Starter</span>
                              <span className="text-lg font-bold text-green-700">$49/user/month</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center space-x-1 mb-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>Basic competitive intelligence</span>
                              </div>
                              <div className="flex items-center space-x-1 mb-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>5 competitors monitored</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>Email alerts & reports</span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-green-100">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-900">Professional</span>
                              <span className="text-lg font-bold text-green-700">$99/user/month</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center space-x-1 mb-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>Advanced AI insights</span>
                              </div>
                              <div className="flex items-center space-x-1 mb-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>Unlimited competitors</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>API access & integrations</span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-green-100">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-gray-900">Enterprise</span>
                              <span className="text-lg font-bold text-green-700">$199/user/month</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center space-x-1 mb-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>Custom AI models</span>
                              </div>
                              <div className="flex items-center space-x-1 mb-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>Dedicated success manager</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>Priority support & SLA</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-4">{competitor.name} Pricing</h4>
                        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                          <p className="text-sm text-gray-700 mb-3">{competitor.productIntelligence.pricingStrategy.content}</p>
                          <div className="pt-3 border-t border-gray-100">
                            <div className="flex items-center space-x-2 text-sm">
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                              <span className="font-medium text-gray-900">Competitive Insight:</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {competitor.name === 'Salesforce' ? 'Higher pricing creates opportunity for value-based positioning in mid-market.' :
                               competitor.name === 'HubSpot' ? 'Freemium model attracts initial users but pricing scales quickly with usage.' :
                               competitor.name === 'Pipedrive' ? 'Aggressive pricing in SMB segment requires competitive response.' :
                               'Premium pricing creates opportunity for competitive displacement.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Integration & Ecosystem */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Settings className="w-5 h-5 text-indigo-600" />
                      <span>Integration & Ecosystem</span>
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                        <h4 className="font-semibold text-indigo-900 mb-4">Our Integration Ecosystem</h4>
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4 border border-indigo-100">
                            <div className="flex items-center space-x-2 mb-2">
                              <Settings className="w-4 h-4 text-indigo-600" />
                              <span className="font-medium text-gray-900">Platform Integrations</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>• 250+ native integrations</div>
                              <div>• Salesforce, HubSpot, Pipedrive native connectors</div>
                              <div>• Microsoft Teams, Slack, Discord</div>
                              <div>• Zapier with 3,000+ app connections</div>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-indigo-100">
                            <div className="flex items-center space-x-2 mb-2">
                              <Package className="w-4 h-4 text-indigo-600" />
                              <span className="font-medium text-gray-900">Developer Tools</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>• REST API with OpenAPI 3.0 spec</div>
                              <div>• Webhooks for real-time updates</div>
                              <div>• Python & JavaScript SDKs</div>
                              <div>• GraphQL endpoint for custom queries</div>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-indigo-100">
                            <div className="flex items-center space-x-2 mb-2">
                              <Shield className="w-4 h-4 text-indigo-600" />
                              <span className="font-medium text-gray-900">Enterprise Security</span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>• SOC 2 Type II certified</div>
                              <div>• SSO with SAML 2.0 & OAuth</div>
                              <div>• Role-based access controls</div>
                              <div>• Data encryption at rest & in transit</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-4">{competitor.name} Integration</h4>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <p className="text-sm text-gray-700 mb-4">{competitor.productIntelligence.integrations.content}</p>
                          
                          <div className="border-t border-gray-100 pt-3">
                            <h5 className="font-medium text-gray-900 mb-2">Competitive Analysis</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                                <span className="text-gray-700">
                                  <span className="font-medium">Advantage:</span> {competitor.name === 'Salesforce' ? 'Massive AppExchange ecosystem with 5,000+ apps' :
                                   competitor.name === 'HubSpot' ? 'Strong marketplace with 1,000+ integrations' :
                                   competitor.name === 'Pipedrive' ? 'Good coverage of essential business tools' :
                                   'Comprehensive support ecosystem'}
                                </span>
                              </div>
                              <div className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                                <span className="text-gray-700">
                                  <span className="font-medium">Weakness:</span> {competitor.name === 'Salesforce' ? 'Complex setup and high implementation costs' :
                                   competitor.name === 'HubSpot' ? 'Limited enterprise-grade security options' :
                                   competitor.name === 'Pipedrive' ? 'Smaller ecosystem, fewer specialized integrations' :
                                   'Integration complexity for smaller businesses'}
                                </span>
                              </div>
                              <div className="flex items-start space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                <span className="text-gray-700">
                                  <span className="font-medium">Opportunity:</span> Target customers frustrated with their integration complexity and costs
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Integrations Section */}
              {activeSection === 'integrations' && (
                <>
                  {/* Enhanced Integration & Ecosystem Section */}
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
                        <Zap className="w-6 h-6 text-indigo-600" />
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900">Integration & Ecosystem</h2>
                          <p className="text-gray-600 mt-1">Comprehensive integration analysis and compatibility</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <select
                          value={integrationFilter}
                          onChange={(e) => setIntegrationFilter(e.target.value as any)}
                          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white"
                        >
                          <option value="all">All Integrations</option>
                          <option value="native">Native Only</option>
                          <option value="api">API Based</option>
                          <option value="third-party">Third-party</option>
                        </select>
                        <button className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium">
                          Integration Guide
                        </button>
                      </div>
                    </div>

                    {/* Integration Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <Package className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-blue-900">CRM Platforms</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>HubSpot</span>
                            <span className="text-green-600 font-medium">Native</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Salesforce</span>
                            <span className="text-blue-600 font-medium">API</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pipedrive</span>
                            <span className="text-blue-600 font-medium">API</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <Briefcase className="w-5 h-5 text-purple-600" />
                          <h3 className="font-semibold text-purple-900">Project Management</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>JIRA</span>
                            <span className="text-green-600 font-medium">Native</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Asana</span>
                            <span className="text-yellow-600 font-medium">Zapier</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Monday.com</span>
                            <span className="text-blue-600 font-medium">API</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center space-x-3 mb-4">
                          <MessageSquare className="w-5 h-5 text-green-600" />
                          <h3 className="font-semibold text-green-900">Communication</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Slack</span>
                            <span className="text-green-600 font-medium">Native</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Microsoft Teams</span>
                            <span className="text-blue-600 font-medium">API</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Discord</span>
                            <span className="text-yellow-600 font-medium">Webhook</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Integration Comparison */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                      <h4 className="font-semibold text-indigo-900 mb-4">Integration Capabilities Comparison</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Our Platform</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>20+ native integrations</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>REST API + GraphQL</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Webhook support</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Custom integrations available</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">{competitor.name}</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>{competitorId === '1' ? '1,000+' : '500+'} integrations</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>Comprehensive API</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {competitorId === '1' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <X className="w-4 h-4 text-red-500" />
                              )}
                              <span>Advanced webhook system</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="w-4 h-4 text-yellow-500" />
                              <span>Complex setup required</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Insights Section */}
              {activeSection === 'insights' && (
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <Lightbulb className="w-6 h-6 text-yellow-600" />
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">Intelligence Reports</h2>
                        <p className="text-gray-600 mt-1">AI-generated competitive intelligence and insights</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-500 text-center py-12">Intelligence Reports content coming soon...</p>
                </div>
              )}

              {/* Feed Section */}
              {activeSection === 'feed' && (
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <Activity className="w-6 h-6 text-indigo-600" />
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">Activity Feed</h2>
                        <p className="text-gray-600 mt-1">Latest competitive activity and updates</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-500 text-center py-12">Activity Feed content coming soon...</p>
                </div>
              )}
              
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Details */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Founded</label>
                    <div className="text-sm text-gray-900">{competitor.founded}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employees</label>
                    <div className="text-sm text-gray-900">{competitor.employees}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Revenue</label>
                    <div className="text-sm font-semibold text-gray-900">{competitor.revenue}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Funding Status</label>
                    <div className="text-sm text-gray-900">{competitor.funding}</div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
                <div className="space-y-2">
                  <a
                    href={`https://${competitor.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group hover:scale-105"
                  >
                    <Globe className="w-4 h-4 text-gray-600 group-hover:text-indigo-600" />
                    <span className="text-sm text-gray-900 group-hover:text-indigo-600">Official Website</span>
                    <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                  </a>
                  {competitor.social.linkedin && (
                    <a
                      href={`https://${competitor.social.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group hover:scale-105"
                    >
                      <Linkedin className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                      <span className="text-sm text-gray-900 group-hover:text-blue-600">LinkedIn Profile</span>
                      <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                    </a>
                  )}
                  {competitor.social.twitter && (
                    <a
                      href={`https://twitter.com/${competitor.social.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group hover:scale-105"
                    >
                      <Twitter className="w-4 h-4 text-gray-600 group-hover:text-blue-400" />
                      <span className="text-sm text-gray-900 group-hover:text-blue-400">Twitter Profile</span>
                      <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                    </a>
                  )}
                </div>
              </div>

              {/* AI Agents */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Agents</h3>
                <div className="space-y-3">
                  {competitor.agents.map((agent) => {
                    const AgentIcon = getAgentIcon(agent.type);
                    return (
                      <div key={agent.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <AgentIcon className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-900">{agent.name}</span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getAgentStatusColor(agent.status)}`}>
                            {agent.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{agent.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{agent.insights} insights</span>
                          <button
                            onClick={() => router.push(`/agents/${agent.id}`)}
                            className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                          >
                            View Details →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 group hover:scale-105 border border-transparent"
                  >
                    <Edit3 className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                    <span className="text-sm text-gray-900 group-hover:text-blue-600">Edit Competitor</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-200 group hover:scale-105 border border-transparent">
                    <Bell className="w-4 h-4 text-gray-600 group-hover:text-indigo-600" />
                    <span className="text-sm text-gray-900 group-hover:text-indigo-600">Create Alert</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-200 group hover:scale-105 border border-transparent">
                    <MessageSquare className="w-4 h-4 text-gray-600 group-hover:text-indigo-600" />
                    <span className="text-sm text-gray-900 group-hover:text-indigo-600">Add Note</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-200 group hover:scale-105 border border-transparent">
                    <Download className="w-4 h-4 text-gray-600 group-hover:text-indigo-600" />
                    <span className="text-sm text-gray-900 group-hover:text-indigo-600">Export Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Competitor Profile</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-8">
                {/* Key Products & Services */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span>Key Products & Services</span>
                  </h3>
                  <div className="space-y-3">
                    {editForm.key_products.map((product, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={product}
                          onChange={(e) => updateItem('key_products', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter product or service..."
                        />
                        <button
                          onClick={() => removeItem('key_products', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addItem('key_products', 'New Product/Service')}
                      className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product/Service</span>
                    </button>
                  </div>
                </div>

                {/* Competitive Strengths */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Competitive Strengths</span>
                  </h3>
                  <div className="space-y-3">
                    {editForm.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={strength}
                          onChange={(e) => updateItem('strengths', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter competitive strength..."
                        />
                        <button
                          onClick={() => removeItem('strengths', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addItem('strengths', 'New Strength')}
                      className="flex items-center space-x-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Strength</span>
                    </button>
                  </div>
                </div>

                {/* Competitive Weaknesses */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span>Competitive Weaknesses</span>
                  </h3>
                  <div className="space-y-3">
                    {editForm.weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={weakness}
                          onChange={(e) => updateItem('weaknesses', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="Enter competitive weakness..."
                        />
                        <button
                          onClick={() => removeItem('weaknesses', index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addItem('weaknesses', 'New Weakness')}
                      className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Weakness</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}