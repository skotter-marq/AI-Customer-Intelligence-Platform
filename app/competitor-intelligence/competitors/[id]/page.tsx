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
 Bookmark,
 Heart,
 Flame,
 TrendingUp as Trending,
 Info,
 Minus,
 Download,
 Calendar as CalendarIcon
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
 const competitorId = params?.id as string;
 
 const [competitor, setCompetitor] = useState<CompetitorProfile | null>(null);
 const [loading, setLoading] = useState(true);
 const [activeSection, setActiveSection] = useState<'feed' | 'insights' | 'features' | 'agents'>('feed');
 const [editingSection, setEditingSection] = useState<string | null>(null);
 const [editContent, setEditContent] = useState<string>('');
 const [isGenerating, setIsGenerating] = useState<string | null>(null);
 const [feedFilter, setFeedFilter] = useState<'all' | 'ai_insight' | 'product_update' | 'competitive_action'>('all');
 const [bookmarked, setBookmarked] = useState(false);
 const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
 
 // CSV export states
 const [csvDateRange, setCsvDateRange] = useState({
 start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
 end: new Date()
 });
 const [showDatePicker, setShowDatePicker] = useState(false);
 const [currentPage, setCurrentPage] = useState(1);
 const itemsPerPage = 5;
 const [isEditing, setIsEditing] = useState(false);
 const [editForm, setEditForm] = useState({
 key_products: [] as string[],
 strengths: [] as string[],
 weaknesses: [] as string[]
 });
 
 
 // New section states

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
  // Helper function to normalize competitor ID
  const getCompetitorType = (id: string) => {
  const normalizedId = id.toLowerCase();
  if (normalizedId === '1' || normalizedId === 'salesforce') return 'salesforce';
  if (normalizedId === '2' || normalizedId === 'hubspot') return 'hubspot';
  if (normalizedId === '3' || normalizedId === 'pipedrive') return 'pipedrive';
  if (normalizedId === '4' || normalizedId === 'zendesk') return 'zendesk';
  // Return salesforce as default for unknown IDs since it's our main competitor
  return 'salesforce';
  };
  
  const competitorType = getCompetitorType(competitorId);
  
  // Handle unknown competitor types by showing appropriate data
  const competitorData = {
  'salesforce': {
   name: 'Salesforce',
   logo: 'https://logo.clearbit.com/salesforce.com',
   industry: 'CRM & Sales Automation',
   location: 'San Francisco, CA',
   website: 'salesforce.com',
   founded: '1999',
   employees: '79,000+',
   revenue: '$31.4B ARR',
   funding: 'Public (NYSE: CRM)',
   threat_level: 'high' as const,
   overallScore: 94,
   marketShare: 23.1,
   customerSatisfaction: 4.2,
   growthRate: 18,
   innovationScore: 92,
   totalReviews: 18547,
   averageRating: 4.2,
   trustScore: 89,
   recommendationRate: 78,
   tags: ['Enterprise', 'AI/ML', 'Cloud Platform', 'Market Leader'],
   key_products: ['Sales Cloud', 'Service Cloud', 'Marketing Cloud', 'Einstein AI', 'Tableau', 'Slack Integration'],
   social: { linkedin: 'linkedin.com/company/salesforce', twitter: '@Salesforce' }
  },
  'hubspot': {
   name: 'HubSpot',
   logo: 'https://logo.clearbit.com/hubspot.com',
   industry: 'Inbound Marketing & Sales',
   location: 'Cambridge, MA',
   website: 'hubspot.com',
   founded: '2006',
   employees: '7,000+',
   revenue: '$1.7B ARR',
   funding: 'Public (NYSE: HUBS)',
   threat_level: 'high' as const,
   overallScore: 89,
   marketShare: 8.7,
   customerSatisfaction: 4.6,
   growthRate: 32,
   innovationScore: 87,
   totalReviews: 12834,
   averageRating: 4.6,
   trustScore: 92,
   recommendationRate: 89,
   tags: ['Inbound Marketing', 'SMB Focused', 'Freemium', 'User-Friendly'],
   key_products: ['Marketing Hub', 'Sales Hub', 'Service Hub', 'CMS Hub', 'AI Content Assistant'],
   social: { linkedin: 'linkedin.com/company/hubspot', twitter: '@HubSpot' }
  },
  'pipedrive': {
   name: 'Pipedrive',
   logo: 'https://logo.clearbit.com/pipedrive.com',
   industry: 'Sales CRM & Pipeline Management',
   location: 'Tallinn, Estonia',
   website: 'pipedrive.com',
   founded: '2010',
   employees: '1,000+',
   revenue: '$142M ARR',
   funding: '$90M Series B',
   threat_level: 'medium' as const,
   overallScore: 78,
   marketShare: 2.3,
   customerSatisfaction: 4.5,
   growthRate: 41,
   innovationScore: 73,
   totalReviews: 5621,
   averageRating: 4.5,
   trustScore: 94,
   recommendationRate: 91,
   tags: ['Visual Pipeline', 'SMB CRM', 'Affordable', 'European'],
   key_products: ['Sales CRM', 'Pipeline Management', 'Activity Tracking', 'Email Sync', 'Mobile App'],
   social: { linkedin: 'linkedin.com/company/pipedrive', twitter: '@Pipedrive' }
  }
  };
  
  const data = competitorData[competitorType as keyof typeof competitorData] || competitorData['salesforce'];
  
  const mockProfile: CompetitorProfile = {
  id: competitorId,
  name: data.name,
  logo: data.logo,
  industry: data.industry,
  location: data.location,
  website: data.website,
  status: 'active',
  threat_level: data.threat_level,
  founded: data.founded,
  employees: data.employees,
  revenue: data.revenue,
  funding: data.funding,
  last_updated: '2024-01-15',
  social: data.social,
  
  // Enhanced metrics
  overallScore: data.overallScore,
  marketShare: data.marketShare,
  customerSatisfaction: data.customerSatisfaction,
  growthRate: data.growthRate,
  innovationScore: data.innovationScore,
  userReviews: {
   totalReviews: data.totalReviews,
   averageRating: data.averageRating,
   trustScore: data.trustScore,
   recommendationRate: data.recommendationRate
  },

  // Tags and Products
  tags: data.tags,
  key_products: data.key_products,

  // AI Agents for this competitor
  agents: competitorType === 'salesforce' 
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
   : competitorType === 'hubspot'
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
   : competitorType === 'pipedrive'
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
   content: competitorType === 'salesforce' 
   ? 'Salesforce dominates the CRM landscape with comprehensive cloud solutions serving 150,000+ companies globally. Their Einstein AI platform and extensive ecosystem create significant competitive moats, though complexity and pricing remain barriers for smaller organizations.'
   : competitorType === 'hubspot'
   ? 'HubSpot has revolutionized inbound marketing with integrated CRM, marketing, and sales tools. Their freemium model and user-friendly approach drive strong SMB adoption, with recent AI investments challenging our market position.'
   : competitorType === 'pipedrive'
   ? 'Pipedrive excels in visual sales pipeline management for SMBs with intuitive design and competitive pricing. Strong European presence and high user satisfaction make them a formidable competitor in our target market segments.'
   : 'Zendesk leads customer service software with comprehensive support solutions. While primarily focused on support rather than sales intelligence, their platform expansion and AI initiatives present adjacent competitive threats.',
   confidence: 94,
   lastGenerated: '2024-01-15T10:30:00Z',
   sources: ['Company reports', 'Market analysis', 'User reviews', 'Industry research'],
   isManuallyEdited: false
  },

  businessModel: {
   content: competitorType === 'salesforce'
   ? 'Multi-cloud SaaS platform with land-and-expand strategy. Primary revenue from subscriptions ($26.5B) with high-value enterprise contracts. Strong ecosystem monetization through AppExchange and professional services.'
   : competitorType === 'hubspot' 
   ? 'Freemium-to-premium model across Marketing, Sales, Service, and CMS hubs. Viral growth through free tier drives customer acquisition with premium conversion rates around 15-20%. Average customer value growing 18% YoY.'
   : competitorType === 'pipedrive'
   ? 'Simple subscription model ($14.90-$99/user/month) targeting sales teams. High retention (94%) in SMB segment with focus on ease of use and quick value realization. Strong European market presence.'
   : 'Multi-product strategy with Support Suite as core offering. Expansion revenue through additional products and seat growth. Average customer spends ~$8K annually with 95%+ enterprise retention.',
   confidence: 91,
   lastGenerated: '2024-01-15T09:15:00Z',
   sources: ['Financial reports', 'Investor presentations', 'Pricing analysis'],
   isManuallyEdited: false
  },

  marketPositioning: {
   content: competitorType === 'salesforce'
   ? 'Positioned as complete Customer 360 platform for enterprise. "AI for Everyone" messaging with Einstein. Dominates large enterprise but expensive for SMB. Strong partner ecosystem drives adoption.'
   : competitorType === 'hubspot'
   ? 'Champions inbound methodology with "grow better" philosophy. Targets marketing-sales alignment in SMB/mid-market. Content marketing and freemium model drive organic growth and brand advocacy.'
   : competitorType === 'pipedrive'
   ? 'Focuses on "CRM for salespeople" with visual pipeline emphasis. Targets SMB sales teams wanting simplicity over complexity. Strong word-of-mouth and user satisfaction drive growth.'
   : 'Leads customer service space with "easy-to-use" positioning. Targets support teams across SMB to enterprise. Recent expansion into sales tools broadens competitive overlap.',
   confidence: 88,
   lastGenerated: '2024-01-14T14:45:00Z',
   sources: ['Marketing materials', 'Competitive analysis', 'Conference content'],
   isManuallyEdited: false
  },

  productIntelligence: {
   overview: {
   content: competitorType === 'salesforce'
    ? 'Comprehensive platform with 15+ clouds including Sales, Marketing, Service, Commerce. Einstein AI embedded across products. Recent Slack integration and Tableau analytics enhance offering.'
    : competitorType === 'hubspot'
    ? 'Integrated platform with Marketing Hub, Sales Hub, Service Hub, and CMS Hub. AI features include content assistant and conversation intelligence. Strong ecosystem with 1,000+ integrations.'
    : competitorType === 'pipedrive'
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
    theirSupport: competitorType === 'salesforce' || competitorType === 'hubspot' ? 'full' : 'partial',
    advantage: competitorType === 'salesforce' ? 'them' : 'neutral'
   },
   {
    name: 'Pipeline Management',
    description: 'Visual deal tracking and sales process optimization',
    ourSupport: 'full',
    theirSupport: 'full',
    advantage: competitorType === 'pipedrive' ? 'them' : 'neutral'
   },
   {
    name: 'Marketing Automation',
    description: 'Email campaigns, lead nurturing, and conversion tracking',
    ourSupport: 'partial',
    theirSupport: competitorType === 'hubspot' ? 'full' : 'partial',
    advantage: competitorType === 'hubspot' ? 'them' : 'neutral'
   }
   ],
   pricingStrategy: {
   content: competitorType === 'salesforce'
    ? 'Premium pricing model with enterprise focus. Essentials ($25/user/month) to Unlimited ($300+). High total cost of ownership with add-ons and customization.'
    : competitorType === 'hubspot'
    ? 'Freemium model with tiered pricing. Free CRM to Enterprise ($3,200/month). Pricing scales with contacts and features. Strong value proposition in SMB segment.'
    : competitorType === 'pipedrive'
    ? 'Transparent, competitive pricing ($14.90-$99/user/month). No setup fees or long-term contracts. Strong value in SMB market with clear feature differentiation.'
    : 'Tiered pricing from $55-$215/agent/month. Additional products priced separately. Recent 15-20% price increases across most plans.',
   confidence: 89,
   lastGenerated: '2024-01-15T11:00:00Z',
   sources: ['Pricing pages', 'Sales intelligence', 'Customer feedback'],
   isManuallyEdited: false
   },
   integrations: {
   content: competitorType === 'salesforce'
    ? 'AppExchange marketplace with 5,000+ applications. Native integrations with Google, Microsoft, Slack. MuleSoft provides enterprise connectivity.'
    : competitorType === 'hubspot'
    ? 'App Marketplace with 1,000+ integrations. Native connections to Salesforce, Gmail, Shopify. Strong Zapier integration for workflow automation.'
    : competitorType === 'pipedrive'
    ? '350+ marketplace integrations including Slack, Trello, Mailchimp. Zapier support provides access to 3,000+ additional apps.'
    : 'Marketplace with 1,000+ apps focused on customer service. Strong integrations with Salesforce, JIRA, Slack for enterprise workflows.',
   confidence: 86,
   lastGenerated: '2024-01-14T16:30:00Z',
   sources: ['Integration marketplaces', 'API documentation', 'User reviews'],
   isManuallyEdited: false
   }
  },

  swotAnalysis: {
   strengths: competitorType === 'salesforce' 
   ? [
    'Market leading position with 23% CRM market share',
    'Comprehensive platform covering entire customer lifecycle',
    'Strong AI capabilities with Einstein across all products',
    'Extensive partner and developer ecosystem'
    ]
   : competitorType === 'hubspot'
   ? [
    'Leading inbound marketing methodology and education',
    'User-friendly interface with quick time-to-value', 
    'Successful freemium model driving acquisition',
    'Strong content marketing and thought leadership'
    ]
   : competitorType === 'pipedrive'
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
   weaknesses: competitorType === 'salesforce'
   ? [
    'High complexity and steep learning curve',
    'Expensive pricing limits SMB adoption',
    'Over-engineering for simple use cases',
    'Heavy dependence on partner ecosystem'
    ]
   : competitorType === 'hubspot'
   ? [
    'Pricing becomes expensive with contact growth',
    'Limited enterprise features vs specialized competitors',
    'Smaller professional services organization',
    'Marketing focus may limit pure sales appeal'
    ]
   : competitorType === 'pipedrive'
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
   opportunities: competitorType === 'salesforce'
   ? [
    'AI-powered automation market growth',
    'International market expansion',
    'Industry-specific cloud development',
    'Small business market penetration'
    ]
   : competitorType === 'hubspot'
   ? [
    'Enterprise market expansion',
    'International growth opportunities',
    'E-commerce platform integration',
    'AI and machine learning advancement'
    ]
   : competitorType === 'pipedrive'
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
   threats: competitorType === 'salesforce'
   ? [
    'Microsoft Dynamics 365 integration threat',
    'Economic downturn affecting enterprise spending',
    'New AI-focused competitors',
    'Regulatory data privacy changes'
    ]
   : competitorType === 'hubspot'
   ? [
    'Enterprise competitors expanding to SMB',
    'Economic pressure on SMB tech spending',
    'Rising customer acquisition costs',
    'Major platform integration (Microsoft, Google)'
    ]
   : competitorType === 'pipedrive'
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
   description: competitorType === 'salesforce' ? 'Enterprise tier pricing increased 15% with Einstein AI features included' : competitorType === 'hubspot' ? 'New Professional tier introduced at $800/month between Starter and Enterprise' : competitorType === 'pipedrive' ? 'Enterprise tier launched at $99/user/month with advanced features' : '18% price increase across Support Suite plans',
   impact: 'high',
   timestamp: '2024-01-15T08:30:00Z',
   source: 'Company announcement',
   confidence: 94
   },
   {
   id: 'intel-2',
   type: 'product',
   title: 'AI Feature Release',
   description: competitorType === 'salesforce' ? 'Einstein GPT integration provides automated content generation and deal insights' : competitorType === 'hubspot' ? 'AI Content Assistant launched for automated blog posts and email content' : competitorType === 'pipedrive' ? 'AI Sales Assistant provides lead scoring and next-best-action recommendations' : 'Advanced AI for ticket routing and sentiment analysis with 95% accuracy',
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

 const exportToCSV = () => {
 if (!competitor?.activityFeed) return;

 // Filter activities by date range
 const filteredActivities = competitor.activityFeed.filter(activity => {
  const activityDate = new Date(activity.timestamp);
  return activityDate >= csvDateRange.start && activityDate <= csvDateRange.end;
 });

 // Create CSV headers
 const headers = [
  'Date',
  'Title',
  'Type',
  'Importance',
  'Category',
  'Description',
  'Action Required',
  'Source'
 ];

 // Convert activities to CSV rows
 const csvRows = filteredActivities.map(activity => [
  new Date(activity.timestamp).toLocaleDateString(),
  `"${activity.title.replace(/"/g, '""')}"`,
  activity.type,
  activity.importance,
  activity.category,
  `"${activity.description.replace(/"/g, '""')}"`,
  activity.actionRequired ? 'Yes' : 'No',
  competitor.name
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
 link.download = `${competitor.name.toLowerCase().replace(/\s+/g, '-')}-intelligence-feed-${new Date().toISOString().split('T')[0]}.csv`;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);
 
 setShowDatePicker(false);
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
 return competitor?.activityFeed?.filter(activity => 
  feedFilter === 'all' || activity.type === feedFilter
 ) || [];
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


 if (loading) {
 return (
  <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
  <div className="p-6">
   <div className="max-w-7xl mx-auto">
   <div className="flex items-center justify-center min-h-96">
    <div className="text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#4285f4' }}></div>
    <p className="calendly-body mt-4">Loading competitor profile...</p>
    </div>
   </div>
   </div>
  </div>
  </div>
 );
 }

 if (!competitor) {
 return (
  <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
  <div className="p-6">
   <div className="max-w-7xl mx-auto">
   <div className="flex items-center justify-center min-h-96">
    <div className="text-center">
    <Building className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
    <h1 className="calendly-h1" style={{ marginBottom: '8px' }}>Competitor Not Found</h1>
    <p className="calendly-body" style={{ marginBottom: '24px' }}>The competitor profile you're looking for doesn't exist.</p>
    <button
     onClick={() => router.push('/competitors')}
     className="calendly-btn-primary"
    >
     Go Back
    </button>
    </div>
   </div>
   </div>
  </div>
  </div>
 );
 }

 return (
 <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
  {/* Navigation */}
  <div className="calendly-card-static border-b" style={{ margin: '0 24px 24px 24px', padding: '16px 24px', borderRadius: '0' }}>
  <div className="max-w-7xl mx-auto">
   <div className="flex items-center space-x-4">
   <button
    onClick={() => router.push('/competitors')}
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
    onClick={() => router.push('/competitors')}
    className="calendly-body-sm "
    style={{ color: '#718096' }}
    onMouseEnter={(e) => {
     e.currentTarget.style.color = '#4285f4';
    }}
    onMouseLeave={(e) => {
     e.currentTarget.style.color = '#718096';
    }}
    >
    Competitors
    </button>
    <span style={{ color: '#a0aec0' }}>›</span>
    <span className="calendly-body-sm font-medium" style={{ color: '#1a1a1a' }}>{competitor.name}</span>
   </div>
   </div>
  </div>
  </div>

  <div className="p-4 sm:p-6">
  <div className="max-w-7xl mx-auto">
   {/* Main Header */}
   <div className="mb-8">
   <div className="calendly-card" style={{ padding: '32px' }}>
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
      className="calendly-btn-primary flex items-center space-x-2"
     >
      <ExternalLink className="w-4 h-4" />
      <span>Visit Site</span>
     </button>
     <button 
      onClick={() => router.push(`/competitor-intelligence/add-competitor?edit=${competitorId}`)}
      className="calendly-btn-secondary flex items-center space-x-2"
     >
      <Edit3 className="w-4 h-4" />
      <span>Edit Competitor</span>
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
   <div className="calendly-card-static" style={{ marginBottom: '24px' }}>
     <div className="border-b border-gray-200">
       <nav className="-mb-px flex space-x-8">
         {[
           { key: 'feed', label: 'Intelligence Feed', icon: Activity },
           { key: 'insights', label: 'Key Insights', icon: Lightbulb },
           { key: 'features', label: 'Product Features', icon: Package },
           { key: 'agents', label: 'AI Agents', icon: Bot }
         ].map(({ key, label, icon: Icon }) => (
           <button
             key={key}
             onClick={() => setActiveSection(key as any)}
             className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
               activeSection === key
                 ? 'border-blue-500 text-blue-600'
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
             }`}
           >
             <Icon className="w-4 h-4" />
             <span>{label}</span>
           </button>
         ))}
       </nav>
     </div>
   </div>

   {/* Main Content */}
   <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
   {/* Main Content Area */}
   <div className="lg:col-span-3 space-y-6">
    

    {/* Intelligence Feed Section */}
    {activeSection === 'feed' && (
    <div className="calendly-card">
    <div className="flex items-center justify-between mb-6">
     <div className="flex items-center space-x-3">
     <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
      <Activity className="w-5 h-5" style={{ color: '#4285f4' }} />
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
        {competitor?.activityFeed?.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        return activityDate >= csvDateRange.start && activityDate <= csvDateRange.end;
        }).length || 0} activities in range
       </span>
       <div className="flex space-x-2">
        <button
        onClick={() => setShowDatePicker(false)}
        className="px-3 py-1 text-gray-600 rounded text-sm"
        >
        Cancel
        </button>
        <button
        onClick={exportToCSV}
        className="calendly-btn-primary flex items-center space-x-1 text-sm"
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
     {getPaginatedActivities().map((activity) => {
     const Icon = getActivityIcon(activity.type);
     const isExpanded = expandedItems.has(activity.id);
     
     return (
      <div key={activity.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
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
         className="flex items-center space-x-1 text-xs text-indigo-600 font-medium "
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
       className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed "
      >
       Previous
      </button>
      
      <div className="flex space-x-1">
       {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(page => (
       <button
        key={page}
        onClick={() => setCurrentPage(page)}
        className={`px-3 py-1.5 text-sm rounded-lg ${
        currentPage === page
         ? 'bg-indigo-600 text-white'
         : 'border border-gray-300 '
        }`}
       >
        {page}
       </button>
       ))}
      </div>
      
      <button
       onClick={() => setCurrentPage(prev => Math.min(getTotalPages(), prev + 1))}
       disabled={currentPage === getTotalPages()}
       className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed "
      >
       Next
      </button>
      </div>
     </div>
     )}
    </div>
    </div>
    )}

    {/* Key Insights Section */}
    {activeSection === 'insights' && (
    <div className="calendly-card">
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
    )}

    {/* Product Features Section */}
    {activeSection === 'features' && (
    <div className="calendly-card">
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
    )}

    {/* AI Agents Section */}
    {activeSection === 'agents' && (
      <div className="calendly-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Bot className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Monitoring Agents</h2>
            <p className="text-sm text-gray-600">Automated agents tracking this competitor</p>
          </div>
        </div>

        {competitor?.agents && competitor.agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitor.agents.map((agent, index) => (
              <div 
                key={agent.id} 
                onClick={() => router.push(`/agents/${agent.id}`)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{agent.name}</h3>
                      <p className="text-sm text-gray-500">{agent.type} agent</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    agent.status === 'active' 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : agent.status === 'paused'
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {agent.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Run:</span>
                    <span className="font-medium text-gray-900">
                      {agent.lastRun ? new Date(agent.lastRun).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Frequency:</span>
                    <span className="font-medium text-gray-900">{agent.frequency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Insights:</span>
                    <span className="font-medium text-gray-900">{agent.insights}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/agents/${agent.id}/edit`);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Configure
                  </button>
                  <span className="text-sm text-gray-600">
                    View Profile →
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Agents Configured</h3>
            <p className="text-gray-600 mb-4">Set up automated monitoring agents to track this competitor's activities</p>
            <button
              onClick={() => router.push(`/agents/create?competitor=${competitorId}`)}
              className="calendly-btn-primary"
            >
              Create First Agent
            </button>
          </div>
        )}
      </div>
    )}

    
   </div>

   {/* Sidebar */}
   <div className="space-y-6">
    {/* Company Details */}
    <div className="calendly-card">
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
    <div className="calendly-card">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
    <div className="space-y-2">
     <a
     href={`https://${competitor.website}`}
     target="_blank"
     rel="noopener noreferrer"
     className="flex items-center space-x-3 p-3 rounded-lg group "
     >
     <Globe className="w-4 h-4 text-gray-600 " />
     <span className="text-sm text-gray-900 ">Official Website</span>
     <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
     </a>
     {competitor.social.linkedin && (
     <a
      href={`https://${competitor.social.linkedin}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center space-x-3 p-3 rounded-lg group "
     >
      <Linkedin className="w-4 h-4 text-gray-600 " />
      <span className="text-sm text-gray-900 ">LinkedIn Profile</span>
      <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
     </a>
     )}
     {competitor.social.twitter && (
     <a
      href={`https://twitter.com/${competitor.social.twitter.replace('@', '')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center space-x-3 p-3 rounded-lg group "
     >
      <Twitter className="w-4 h-4 text-gray-600 " />
      <span className="text-sm text-gray-900 ">Twitter Profile</span>
      <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
     </a>
     )}
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
    className="p-2 rounded-lg "
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
       className="p-2 text-red-600 rounded-lg "
      >
       <X className="w-4 h-4" />
      </button>
      </div>
     ))}
     <button
      onClick={() => addItem('key_products', 'New Product/Service')}
      className="flex items-center space-x-2 px-3 py-2 text-blue-600 rounded-lg "
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
       className="p-2 text-red-600 rounded-lg "
      >
       <X className="w-4 h-4" />
      </button>
      </div>
     ))}
     <button
      onClick={() => addItem('strengths', 'New Strength')}
      className="flex items-center space-x-2 px-3 py-2 text-green-600 rounded-lg "
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
       className="p-2 text-red-600 rounded-lg "
      >
       <X className="w-4 h-4" />
      </button>
      </div>
     ))}
     <button
      onClick={() => addItem('weaknesses', 'New Weakness')}
      className="flex items-center space-x-2 px-3 py-2 text-red-600 rounded-lg "
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
    className="px-4 py-2 text-gray-700 rounded-lg "
    >
    Cancel
    </button>
    <button
    onClick={saveChanges}
    className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2"
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