'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft,
  Zap,
  Target,
  Settings,
  Bell,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Plus,
  Clock,
  Globe,
  DollarSign,
  Users,
  TrendingUp,
  MessageSquare,
  BookOpen,
  Briefcase,
  Sparkles,
  Loader2,
  Shield,
  Eye,
  AlertTriangle,
  Calendar,
  Library,
  ArrowRight
} from 'lucide-react';

interface NewAgent {
  name: string;
  description: string;
  type: 'pricing' | 'features' | 'marketing' | 'customers' | 'partnerships' | 'content' | 'events' | 'news' | 'hiring' | 'social' | 'funding' | 'compliance' | 'technology' | 'competitive';
  competitor_ids: string[];
  schedule: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'on_trigger';
  sources: string[];
  keywords: string[];
  notification_triggers: string[];
  price_threshold?: number;
  sentiment_tracking: boolean;
  deep_analysis: boolean;
  data_retention_days: number;
}

interface CompetitorProfile {
  id: string;
  name: string;
  logo: string;
  industry: string;
  status: 'active' | 'monitoring' | 'inactive';
  website: string;
}

export default function CreateAgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('edit');
  const isEditMode = !!editId;
  const step1Ref = useRef<HTMLDivElement>(null);
  const aiConfigRef = useRef<HTMLDivElement>(null);

  const [newAgent, setNewAgent] = useState<NewAgent>({
    name: '',
    description: '',
    type: 'pricing',
    competitor_ids: [],
    schedule: 'daily',
    sources: [],
    keywords: [],
    notification_triggers: [],
    sentiment_tracking: false,
    deep_analysis: true,
    data_retention_days: 90
  });

  const [stepsCollapsed, setStepsCollapsed] = useState({
    step1: false,
    step2: false,
    step3: true  // Step 3 starts collapsed until Review is clicked
  });

  const [isCreating, setIsCreating] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [researchComplete, setResearchComplete] = useState(false);
  const [aiPopulatedFields, setAiPopulatedFields] = useState<Set<string>>(new Set());
  const [manuallyEditedFields, setManuallyEditedFields] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    business: false,
    product: false,
    market: false,
    intelligence: false
  });
  const [competitorSearch, setCompetitorSearch] = useState('');
  const [monitorTypeFilter, setMonitorTypeFilter] = useState<string>('all');
  const [newSource, setNewSource] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newTrigger, setNewTrigger] = useState('');
  
  // Library expansion states
  const [showSourceLibrary, setShowSourceLibrary] = useState(false);
  const [showKeywordLibrary, setShowKeywordLibrary] = useState(false);
  const [showTriggerLibrary, setShowTriggerLibrary] = useState(false);

  // Mock competitor data - in real app, fetch from API
  const [competitors, setCompetitors] = useState<CompetitorProfile[]>([
    { id: '1', name: 'Salesforce', logo: 'https://logo.clearbit.com/salesforce.com', industry: 'CRM & Sales', status: 'active', website: 'salesforce.com' },
    { id: '2', name: 'HubSpot', logo: 'https://logo.clearbit.com/hubspot.com', industry: 'Marketing & Sales', status: 'active', website: 'hubspot.com' },
    { id: '3', name: 'Pipedrive', logo: 'https://logo.clearbit.com/pipedrive.com', industry: 'Sales CRM', status: 'monitoring', website: 'pipedrive.com' },
    { id: '4', name: 'Zendesk', logo: 'https://logo.clearbit.com/zendesk.com', industry: 'Customer Support', status: 'active', website: 'zendesk.com' }
  ]);

  const agentTypes = [
    { 
      value: 'pricing', 
      label: 'Pricing Monitor', 
      icon: DollarSign, 
      description: 'Track pricing changes, new tiers, and promotional offers',
      color: 'bg-green-100 text-green-700',
      examples: ['Price increases/decreases', 'New subscription tiers', 'Limited-time offers', 'Enterprise pricing'],
      category: 'business',
      priority: 'high'
    },
    { 
      value: 'features', 
      label: 'Feature Tracker', 
      icon: Target, 
      description: 'Monitor new features, product updates, and capabilities',
      color: 'bg-blue-100 text-blue-700',
      examples: ['New product features', 'API updates', 'Beta releases', 'Integration announcements'],
      category: 'product',
      priority: 'high'
    },
    { 
      value: 'competitive', 
      label: 'Competitive Monitor', 
      icon: Eye, 
      description: 'Monitor direct competitive moves, comparisons, and market positioning',
      color: 'bg-yellow-100 text-yellow-700',
      examples: ['Competitor mentions', 'Comparison pages', 'Competitive content', 'Market positioning'],
      category: 'business',
      priority: 'high'
    },
    { 
      value: 'customers', 
      label: 'Customer Monitor', 
      icon: Users, 
      description: 'Monitor customer wins, losses, case studies, and testimonials',
      color: 'bg-cyan-100 text-cyan-700',
      examples: ['New customer wins', 'Case studies', 'Customer testimonials', 'Logo additions'],
      category: 'business',
      priority: 'high'
    },
    { 
      value: 'marketing', 
      label: 'Marketing Monitor', 
      icon: TrendingUp, 
      description: 'Track marketing campaigns, positioning, and messaging changes',
      color: 'bg-rose-100 text-rose-700',
      examples: ['Ad campaigns', 'Landing page changes', 'Value propositions', 'Brand messaging'],
      category: 'market',
      priority: 'medium'
    },
    { 
      value: 'social', 
      label: 'Social Tracker', 
      icon: MessageSquare, 
      description: 'Monitor social media activity and customer sentiment',
      color: 'bg-pink-100 text-pink-700',
      examples: ['Customer feedback', 'Social campaigns', 'Brand mentions', 'Sentiment shifts'],
      category: 'market',
      priority: 'medium'
    },
    { 
      value: 'partnerships', 
      label: 'Partnership Tracker', 
      icon: Briefcase, 
      description: 'Track strategic partnerships, integrations, and channel relationships',
      color: 'bg-amber-100 text-amber-700',
      examples: ['New integrations', 'Channel partnerships', 'Strategic alliances', 'Technology partnerships'],
      category: 'business',
      priority: 'medium'
    },
    { 
      value: 'funding', 
      label: 'Funding Monitor', 
      icon: TrendingUp, 
      description: 'Track funding rounds, partnerships, and acquisitions',
      color: 'bg-indigo-100 text-indigo-700',
      examples: ['Investment rounds', 'Strategic partnerships', 'Acquisitions', 'IPO activity'],
      category: 'business',
      priority: 'medium'
    },
    { 
      value: 'news', 
      label: 'News Monitor', 
      icon: Globe, 
      description: 'Track news mentions, press releases, and media coverage',
      color: 'bg-purple-100 text-purple-700',
      examples: ['Press releases', 'Media mentions', 'Awards', 'Industry coverage'],
      category: 'market',
      priority: 'medium'
    },
    { 
      value: 'hiring', 
      label: 'Team Monitor', 
      icon: Shield, 
      description: 'Monitor key personnel changes and hiring patterns',
      color: 'bg-orange-100 text-orange-700',
      examples: ['Executive appointments', 'Key hires', 'Team expansions', 'Departures'],
      category: 'intelligence',
      priority: 'medium'
    },
    { 
      value: 'content', 
      label: 'Content Monitor', 
      icon: BookOpen, 
      description: 'Monitor thought leadership, whitepapers, and educational content',
      color: 'bg-emerald-100 text-emerald-700',
      examples: ['Blog posts', 'Whitepapers', 'Webinars', 'Research reports'],
      category: 'market',
      priority: 'low'
    },
    { 
      value: 'events', 
      label: 'Event Tracker', 
      icon: Calendar, 
      description: 'Track conference presence, webinars, and industry events',
      color: 'bg-violet-100 text-violet-700',
      examples: ['Conference sponsorships', 'Speaking engagements', 'Webinar series', 'User events'],
      category: 'market',
      priority: 'low'
    },
    { 
      value: 'technology', 
      label: 'Tech Stack Monitor', 
      icon: Settings, 
      description: 'Track technology adoptions, infrastructure changes, and technical decisions',
      color: 'bg-slate-100 text-slate-700',
      examples: ['Tech stack changes', 'Cloud migrations', 'API updates', 'Architecture shifts'],
      category: 'product',
      priority: 'low'
    },
    { 
      value: 'compliance', 
      label: 'Compliance Tracker', 
      icon: AlertTriangle, 
      description: 'Monitor security certifications, compliance updates, and regulatory changes',
      color: 'bg-red-100 text-red-700',
      examples: ['SOC 2 compliance', 'GDPR updates', 'Security certifications', 'Privacy policies'],
      category: 'product',
      priority: 'low'
    }
  ];

  // Comprehensive Data Sources Library
  const DATA_SOURCE_CATEGORIES = {
    'Company Websites & Pages': [
      'Company homepage', 'About us page', 'Team pages', 'Leadership pages',
      'Investor relations', 'Contact pages', 'Careers pages', 'Office locations'
    ],
    'Product & Service Pages': [
      'Product pages', 'Feature pages', 'Service descriptions', 'Solution pages',
      'Use case pages', 'Integration pages', 'API documentation', 'Developer docs'
    ],
    'Pricing & Sales': [
      'Pricing pages', 'Plan comparisons', 'Enterprise pages', 'Sales pages',
      'Demo pages', 'Trial pages', 'Billing pages', 'Subscription pages'
    ],
    'Content & Resources': [
      'Company blogs', 'Resource centers', 'Knowledge base', 'Help centers',
      'Whitepapers', 'Case studies', 'Webinar pages', 'eBooks',
      'Research reports', 'Guides', 'Templates', 'Toolkits'
    ],
    'News & Communication': [
      'Press releases', 'News pages', 'Media kits', 'Brand guidelines',
      'Event pages', 'Conference listings', 'Speaking engagements', 'Awards pages'
    ],
    'Legal & Compliance': [
      'Terms of service', 'Privacy policies', 'Security pages', 'Compliance docs',
      'Certifications', 'Data protection', 'Cookie policies', 'Legal notices'
    ],
    'Social Media': [
      'LinkedIn company page', 'Twitter feed', 'Facebook page', 'Instagram',
      'YouTube channel', 'TikTok', 'Reddit mentions', 'Discord servers'
    ],
    'Third-Party Platforms': [
      'App stores', 'Plugin marketplaces', 'Integration directories', 'Partner portals',
      'Review sites (G2, Capterra)', 'Rating platforms', 'Comparison sites', 'Forums'
    ],
    'Job & Hiring': [
      'Job board postings', 'LinkedIn jobs', 'AngelList', 'Indeed listings',
      'Glassdoor reviews', 'Recruiting pages', 'Culture pages', 'Benefits pages'
    ],
    'Financial & Business': [
      'SEC filings', 'Annual reports', 'Quarterly reports', 'Financial statements',
      'Crunchbase profile', 'PitchBook data', 'Funding announcements', 'IPO docs'
    ],
    'Technical & Development': [
      'GitHub repositories', 'Technical blogs', 'Engineering blogs', 'Open source projects',
      'Stack Overflow', 'Developer forums', 'Code repositories', 'Technical papers'
    ],
    'Customer & Support': [
      'Support pages', 'FAQ pages', 'Community forums', 'User guides',
      'Troubleshooting docs', 'Status pages', 'Changelog pages', 'Release notes'
    ]
  };

  // Comprehensive Monitoring Keywords Library
  const KEYWORD_CATEGORIES = {
    'Product & Features': [
      'new feature', 'product launch', 'beta release', 'early access',
      'innovation', 'update', 'enhancement', 'improvement', 'upgrade',
      'integration', 'API', 'platform', 'dashboard', 'analytics',
      'AI', 'machine learning', 'automation', 'workflow', 'mobile app'
    ],
    'Pricing & Business Model': [
      'pricing', 'cost', 'price', 'subscription', 'plan', 'tier',
      'enterprise', 'discount', 'promotion', 'sale', 'offer',
      'free trial', 'freemium', 'pricing model', 'billing', 'payment'
    ],
    'Marketing & Positioning': [
      'campaign', 'marketing', 'advertising', 'brand', 'messaging',
      'positioning', 'value proposition', 'competitive advantage', 'differentiation',
      'target market', 'customer segment', 'go-to-market', 'launch strategy'
    ],
    'Customers & Success Stories': [
      'customer', 'client', 'case study', 'success story', 'testimonial',
      'customer win', 'enterprise client', 'logo', 'reference',
      'implementation', 'ROI', 'results', 'outcomes', 'satisfaction'
    ],
    'Partnerships & Integrations': [
      'partnership', 'integration', 'collaboration', 'alliance',
      'channel partner', 'technology partner', 'ecosystem', 'marketplace',
      'connector', 'plugin', 'extension', 'third-party', 'vendor'
    ],
    'Funding & Financial': [
      'funding', 'investment', 'Series A', 'Series B', 'Series C',
      'venture capital', 'IPO', 'acquisition', 'merger', 'valuation',
      'revenue', 'growth', 'financial results', 'earnings', 'profit'
    ],
    'Team & Hiring': [
      'hiring', 'recruitment', 'job opening', 'career', 'team expansion',
      'executive hire', 'leadership', 'VP', 'director', 'CTO', 'CEO',
      'founder', 'employee', 'talent', 'culture', 'remote work'
    ],
    'Competitive & Market': [
      'competitor', 'competition', 'market leader', 'market share',
      'industry', 'vertical', 'alternative', 'comparison', 'versus',
      'benchmark', 'analyst report', 'Gartner', 'Forrester', 'market research'
    ],
    'Technology & Security': [
      'security', 'compliance', 'SOC 2', 'GDPR', 'HIPAA',
      'encryption', 'privacy', 'data protection', 'certification',
      'infrastructure', 'cloud', 'scalability', 'performance', 'uptime'
    ],
    'Events & Content': [
      'conference', 'event', 'webinar', 'workshop', 'summit',
      'speaking', 'presentation', 'keynote', 'sponsor', 'booth',
      'whitepaper', 'research', 'report', 'guide', 'best practices'
    ],
    'Customer Experience': [
      'user experience', 'customer experience', 'usability', 'interface',
      'design', 'feedback', 'review', 'rating', 'NPS', 'CSAT',
      'support', 'service', 'onboarding', 'training', 'adoption'
    ],
    'Industry Specific': [
      'SaaS', 'B2B', 'B2C', 'enterprise software', 'SMB',
      'healthcare', 'fintech', 'edtech', 'martech', 'salestech',
      'HR tech', 'legal tech', 'prop tech', 'retail tech', 'manufacturing'
    ]
  };

  // Comprehensive Alert Triggers Library
  const TRIGGER_CATEGORIES = {
    'Product & Feature Changes': [
      'product_launch', 'new_feature', 'feature_update', 'beta_release',
      'feature_removal', 'product_discontinuation', 'integration_launch',
      'api_update', 'platform_update', 'mobile_app_release'
    ],
    'Pricing & Business Model': [
      'price_change', 'price_increase', 'price_decrease', 'new_pricing_tier',
      'pricing_model_change', 'discount_launch', 'promotion_start',
      'free_trial_change', 'enterprise_pricing', 'billing_change'
    ],
    'Marketing & Communications': [
      'new_campaign', 'messaging_change', 'positioning_update', 'rebrand',
      'brand_guideline_update', 'marketing_material_change', 'website_redesign',
      'content_strategy_shift', 'target_audience_change', 'value_prop_update'
    ],
    'Customer & Success': [
      'new_customer', 'enterprise_customer', 'customer_case_study',
      'customer_testimonial', 'customer_loss', 'churn_increase',
      'satisfaction_change', 'reference_customer', 'logo_addition', 'customer_expansion'
    ],
    'Partnerships & Integrations': [
      'new_partnership', 'strategic_alliance', 'integration_announcement',
      'channel_partnership', 'technology_partnership', 'marketplace_listing',
      'ecosystem_expansion', 'partnership_termination', 'vendor_change', 'supplier_change'
    ],
    'Financial & Funding': [
      'funding_round', 'investment_announcement', 'ipo_filing', 'acquisition',
      'merger', 'financial_results', 'revenue_milestone', 'valuation_change',
      'investor_update', 'earnings_report', 'growth_metrics', 'profitability'
    ],
    'Team & Leadership': [
      'executive_hire', 'leadership_change', 'founder_change', 'key_departure',
      'team_expansion', 'organizational_restructure', 'culture_change',
      'hiring_spree', 'layoffs', 'remote_policy_change', 'office_change', 'acquisition_talent'
    ],
    'Market & Competition': [
      'competitive_mention', 'market_positioning_change', 'competitive_response',
      'market_entry', 'market_exit', 'geographic_expansion', 'vertical_expansion',
      'analyst_recognition', 'award_win', 'ranking_change', 'market_share_change'
    ],
    'Compliance & Security': [
      'security_incident', 'data_breach', 'compliance_update', 'certification_earned',
      'certification_lost', 'policy_update', 'privacy_change', 'terms_update',
      'regulatory_change', 'audit_result', 'security_feature', 'gdpr_update'
    ],
    'Technical & Infrastructure': [
      'outage', 'downtime', 'performance_issue', 'system_upgrade',
      'infrastructure_change', 'technology_migration', 'architecture_update',
      'scalability_improvement', 'api_deprecation', 'technical_debt', 'tech_stack_change'
    ],
    'Content & Thought Leadership': [
      'research_release', 'whitepaper_publication', 'industry_report',
      'thought_leadership', 'speaking_engagement', 'conference_participation',
      'webinar_series', 'content_series', 'expert_interview', 'trend_analysis'
    ],
    'Events & Community': [
      'event_sponsorship', 'conference_speaking', 'community_launch',
      'user_conference', 'developer_event', 'training_program',
      'certification_program', 'partner_event', 'customer_event', 'hackathon'
    ]
  };

  // Flatten arrays for easy searching
  const ALL_SOURCES = Object.values(DATA_SOURCE_CATEGORIES).flat();
  const ALL_KEYWORDS = Object.values(KEYWORD_CATEGORIES).flat();
  const ALL_TRIGGERS = Object.values(TRIGGER_CATEGORIES).flat();

  // Load agent data if in edit mode
  useEffect(() => {
    if (isEditMode && editId) {
      loadAgentForEdit(editId);
      // Scroll to top when entering edit mode
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isEditMode, editId]);

  const loadAgentForEdit = async (agentId: string) => {
    try {
      // TODO: Replace with actual API call when backend is ready
      // For now, find the agent from mock data
      const mockAgents = [
        {
          id: 'agent1', name: 'Pricing Monitor', description: 'Track pricing changes across major CRM platforms',
          type: 'pricing', competitor_ids: ['1', '2'], schedule: 'daily', 
          sources: ['Company website', 'Pricing pages'], keywords: ['pricing', 'cost', 'subscription'],
          notification_triggers: ['price_change'], sentiment_tracking: false, deep_analysis: true,
          data_retention_days: 90, price_threshold: 10
        },
        {
          id: 'agent2', name: 'Feature Tracker', description: 'Monitor new features and product updates',
          type: 'features', competitor_ids: ['1', '2', '3'], schedule: 'weekly',
          sources: ['Product pages', 'Release notes', 'Blogs'], keywords: ['new feature', 'update', 'AI'],
          notification_triggers: ['new_feature'], sentiment_tracking: true, deep_analysis: true,
          data_retention_days: 120
        }
      ];
      
      const agent = mockAgents.find(a => a.id === agentId);
      if (agent) {
        setNewAgent({
          name: agent.name,
          description: agent.description,
          type: agent.type as any,
          competitor_ids: agent.competitor_ids,
          schedule: agent.schedule as any,
          sources: agent.sources,
          keywords: agent.keywords,
          notification_triggers: agent.notification_triggers,
          sentiment_tracking: agent.sentiment_tracking,
          deep_analysis: agent.deep_analysis,
          data_retention_days: agent.data_retention_days,
          price_threshold: agent.price_threshold
        });
        setResearchComplete(true);
        setAiPopulatedFields(new Set(['sources', 'keywords', 'notification_triggers']));
      }
    } catch (error) {
      console.error('Error loading agent for edit:', error);
    }
  };

  const handleAIConfiguration = async () => {
    if (!newAgent.name || !newAgent.type || newAgent.competitor_ids.length === 0) {
      alert('Please provide an agent name, select a monitoring type, and choose at least one competitor');
      return;
    }

    setIsResearching(true);
    try {
      // Simulate AI configuration process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // AI-generated configuration based on agent type and competitors
      const aiConfig = generateAIConfiguration(newAgent.type, newAgent.competitor_ids);
      
      setNewAgent(prev => ({
        ...prev,
        ...aiConfig,
        description: aiConfig.description || prev.description
      }));
      
      setResearchComplete(true);
      setAiPopulatedFields(new Set(['sources', 'keywords', 'notification_triggers', 'description']));

      // Scroll to show the AI Configuration Results (Step 2)
      setTimeout(() => {
        aiConfigRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 300);

    } catch (error) {
      console.error('Error in AI configuration:', error);
      alert('AI configuration failed. Please try again.');
    } finally {
      setIsResearching(false);
    }
  };

  const generateAIConfiguration = (type: string, competitorIds: string[]) => {
    const competitorNames = competitors.filter(c => competitorIds.includes(c.id)).map(c => c.name);
    
    // Get competitor context for smarter selection
    const isEnterprise = competitorNames.some(name => 
      name.toLowerCase().includes('salesforce') || name.toLowerCase().includes('microsoft') || name.toLowerCase().includes('oracle') ||
      name.toLowerCase().includes('sap') || name.toLowerCase().includes('adobe') || name.toLowerCase().includes('ibm')
    );

    // AI-powered intelligent selection from comprehensive libraries
    let sources: string[] = [];
    let keywords: string[] = [];
    let notification_triggers: string[] = [];

    // Smart filtering from comprehensive libraries based on monitoring type
    const getRelevantSources = (type: string): string[] => {
      const relevantCategories: string[] = [];
      
      switch (type) {
        case 'pricing':
          return Object.values(DATA_SOURCE_CATEGORIES)
            .flat()
            .filter(source => {
              const lowerSource = source.toLowerCase();
              return lowerSource.includes('pricing') || lowerSource.includes('subscription') ||
                     lowerSource.includes('tier') || lowerSource.includes('plan') ||
                     lowerSource.includes('cost') || lowerSource.includes('payment') ||
                     lowerSource.includes('billing') || lowerSource.includes('enterprise');
            })
            .slice(0, isEnterprise ? 10 : 8);
            
        case 'features':
          return Object.values(DATA_SOURCE_CATEGORIES)
            .flat()
            .filter(source => {
              const lowerSource = source.toLowerCase();
              return lowerSource.includes('product') || lowerSource.includes('feature') ||
                     lowerSource.includes('release') || lowerSource.includes('changelog') ||
                     lowerSource.includes('api') || lowerSource.includes('developer') ||
                     lowerSource.includes('demo') || lowerSource.includes('beta');
            })
            .slice(0, 8);
            
        case 'marketing':
          return Object.values(DATA_SOURCE_CATEGORIES)
            .flat()
            .filter(source => {
              const lowerSource = source.toLowerCase();
              return lowerSource.includes('landing') || lowerSource.includes('marketing') ||
                     lowerSource.includes('campaign') || lowerSource.includes('ad') ||
                     lowerSource.includes('brand') || lowerSource.includes('social') ||
                     lowerSource.includes('press') || lowerSource.includes('media');
            })
            .slice(0, 8);
            
        case 'customers':
          return Object.values(DATA_SOURCE_CATEGORIES)
            .flat()
            .filter(source => {
              const lowerSource = source.toLowerCase();
              return lowerSource.includes('customer') || lowerSource.includes('case') ||
                     lowerSource.includes('testimonial') || lowerSource.includes('success') ||
                     lowerSource.includes('reference') || lowerSource.includes('client') ||
                     lowerSource.includes('logo') || lowerSource.includes('win');
            })
            .slice(0, 8);
            
        default:
          return ['Company homepage', 'Product pages', 'Company blog', 'Press releases', 'Social media', 'News mentions'];
      }
    };

    const getRelevantKeywords = (type: string): string[] => {
      switch (type) {
        case 'pricing':
          return Object.values(KEYWORD_CATEGORIES)
            .flat()
            .filter(keyword => {
              const lowerKeyword = keyword.toLowerCase();
              return lowerKeyword.includes('price') || lowerKeyword.includes('cost') ||
                     lowerKeyword.includes('discount') || lowerKeyword.includes('promotion') ||
                     lowerKeyword.includes('subscription') || lowerKeyword.includes('tier') ||
                     lowerKeyword.includes('plan') || lowerKeyword.includes('billing');
            })
            .slice(0, isEnterprise ? 12 : 10);
            
        case 'features':
          return Object.values(KEYWORD_CATEGORIES)
            .flat()
            .filter(keyword => {
              const lowerKeyword = keyword.toLowerCase();
              return lowerKeyword.includes('feature') || lowerKeyword.includes('product') ||
                     lowerKeyword.includes('launch') || lowerKeyword.includes('release') ||
                     lowerKeyword.includes('update') || lowerKeyword.includes('integration') ||
                     lowerKeyword.includes('api') || lowerKeyword.includes('beta');
            })
            .slice(0, 10);
            
        case 'marketing':
          return Object.values(KEYWORD_CATEGORIES)
            .flat()
            .filter(keyword => {
              const lowerKeyword = keyword.toLowerCase();
              return lowerKeyword.includes('campaign') || lowerKeyword.includes('marketing') ||
                     lowerKeyword.includes('brand') || lowerKeyword.includes('advertising') ||
                     lowerKeyword.includes('positioning') || lowerKeyword.includes('message') ||
                     lowerKeyword.includes('competitive') || lowerKeyword.includes('differentiat');
            })
            .slice(0, 10);
            
        case 'customers':
          return Object.values(KEYWORD_CATEGORIES)
            .flat()
            .filter(keyword => {
              const lowerKeyword = keyword.toLowerCase();
              return lowerKeyword.includes('customer') || lowerKeyword.includes('client') ||
                     lowerKeyword.includes('case study') || lowerKeyword.includes('testimonial') ||
                     lowerKeyword.includes('success') || lowerKeyword.includes('reference') ||
                     lowerKeyword.includes('win') || lowerKeyword.includes('logo');
            })
            .slice(0, 10);
            
        default:
          return ['update', 'news', 'announcement', 'launch', 'feature', 'product'];
      }
    };

    const getRelevantTriggers = (type: string): string[] => {
      switch (type) {
        case 'pricing':
          return Object.values(TRIGGER_CATEGORIES)
            .flat()
            .filter(trigger => {
              const lowerTrigger = trigger.toLowerCase();
              return lowerTrigger.includes('pricing') || lowerTrigger.includes('discount') ||
                     lowerTrigger.includes('promotion') || lowerTrigger.includes('tier') ||
                     lowerTrigger.includes('subscription') || lowerTrigger.includes('cost');
            })
            .slice(0, 7);
            
        case 'features':
          return Object.values(TRIGGER_CATEGORIES)
            .flat()
            .filter(trigger => {
              const lowerTrigger = trigger.toLowerCase();
              return lowerTrigger.includes('product') || lowerTrigger.includes('feature') ||
                     lowerTrigger.includes('launch') || lowerTrigger.includes('release') ||
                     lowerTrigger.includes('integration') || lowerTrigger.includes('api');
            })
            .slice(0, 7);
            
        case 'marketing':
          return Object.values(TRIGGER_CATEGORIES)
            .flat()
            .filter(trigger => {
              const lowerTrigger = trigger.toLowerCase();
              return lowerTrigger.includes('campaign') || lowerTrigger.includes('marketing') ||
                     lowerTrigger.includes('brand') || lowerTrigger.includes('messaging') ||
                     lowerTrigger.includes('positioning') || lowerTrigger.includes('rebrand');
            })
            .slice(0, 6);
            
        case 'customers':
          return Object.values(TRIGGER_CATEGORIES)
            .flat()
            .filter(trigger => {
              const lowerTrigger = trigger.toLowerCase();
              return lowerTrigger.includes('customer') || lowerTrigger.includes('client') ||
                     lowerTrigger.includes('case_study') || lowerTrigger.includes('testimonial') ||
                     lowerTrigger.includes('logo') || lowerTrigger.includes('reference');
            })
            .slice(0, 6);
            
        default:
          return ['content_update', 'news_mention', 'product_update', 'company_news'];
      }
    };

    sources = getRelevantSources(type);
    keywords = getRelevantKeywords(type);
    notification_triggers = getRelevantTriggers(type);
    
    const configurations: Record<string, any> = {
      pricing: {
        description: `Monitor pricing changes and tier updates across ${competitorNames.join(', ')}`,
        sources,
        keywords,
        notification_triggers,
        schedule: 'daily',
        sentiment_tracking: false,
        deep_analysis: true,
        price_threshold: 5,
        data_retention_days: 90
      },
      features: {
        description: `Track new features and product updates from ${competitorNames.join(', ')}`,
        sources,
        keywords,
        notification_triggers,
        schedule: 'weekly',
        sentiment_tracking: true,
        deep_analysis: true,
        data_retention_days: 120
      },
      marketing: {
        description: `Track marketing campaigns and positioning changes from ${competitorNames.join(', ')}`,
        sources,
        keywords,
        notification_triggers,
        schedule: 'daily',
        sentiment_tracking: true,
        deep_analysis: true,
        data_retention_days: 90
      },
      customers: {
        description: `Monitor customer wins, case studies, and testimonials from ${competitorNames.join(', ')}`,
        sources,
        keywords,
        notification_triggers,
        schedule: 'weekly',
        sentiment_tracking: true,
        deep_analysis: true,
        data_retention_days: 180
      },
      partnerships: {
        description: `Track strategic partnerships and integrations from ${competitorNames.join(', ')}`,
        sources,
        keywords,
        notification_triggers,
        schedule: 'weekly',
        sentiment_tracking: false,
        deep_analysis: true,
        data_retention_days: 180
      },
      content: {
        description: `Monitor thought leadership and educational content from ${competitorNames.join(', ')}`,
        sources,
        keywords,
        notification_triggers,
        schedule: 'weekly',
        sentiment_tracking: false,
        deep_analysis: true,
        data_retention_days: 120
      },
      events: {
        description: `Track conference presence and event participation from ${competitorNames.join(', ')}`,
        sources,
        keywords,
        notification_triggers,
        schedule: 'weekly',
        sentiment_tracking: false,
        deep_analysis: false,
        data_retention_days: 90
      },
      news: {
        description: `Monitor news mentions and press coverage of ${competitorNames.join(', ')}`,
        sources,
        keywords,
        notification_triggers,
        schedule: 'daily',
        sentiment_tracking: true,
        deep_analysis: false,
        data_retention_days: 60
      },
      hiring: {
        description: `Track hiring patterns and key personnel changes at ${competitorNames.join(', ')}`,
        sources,
        keywords,
        notification_triggers,
        schedule: 'weekly',
        sentiment_tracking: false,
        deep_analysis: true,
        data_retention_days: 180
      },
      social: {
        description: `Monitor social media activity and sentiment for ${competitorNames.join(', ')}`,
        sources,
        keywords,
        notification_triggers,
        schedule: 'daily',
        sentiment_tracking: true,
        deep_analysis: true,
        data_retention_days: 60
      },
      funding: {
        description: `Track funding rounds and strategic partnerships for ${competitorNames.join(', ')}`,
        sources,
        keywords,
        notification_triggers,
        schedule: 'weekly',
        sentiment_tracking: false,
        deep_analysis: true,
        data_retention_days: 365
      },
      compliance: {
        description: `Monitor compliance updates and security certifications for ${competitorNames.join(', ')}`,
        sources,
        keywords,
        notification_triggers,
        schedule: 'monthly',
        sentiment_tracking: false,
        deep_analysis: false,
        data_retention_days: 365
      },
      technology: {
        description: `Monitor technology stack and infrastructure changes for ${competitorNames.join(', ')}`,
        sources,
        keywords,
        notification_triggers,
        schedule: 'weekly',
        sentiment_tracking: false,
        deep_analysis: true,
        data_retention_days: 180
      },
      competitive: {
        description: `Monitor direct competitive moves and market positioning from ${competitorNames.join(', ')}`,
        sources,
        keywords,
        notification_triggers,
        schedule: 'daily',
        sentiment_tracking: true,
        deep_analysis: true,
        data_retention_days: 120
      }
    };

    return configurations[type] || configurations.features;
  };

  const handleSaveAgent = async () => {
    setIsCreating(true);
    try {
      if (isEditMode) {
        console.log('Updating agent:', newAgent, 'ID:', editId);
        // Would make PUT request to /api/agents/[id]
      } else {
        console.log('Creating agent:', newAgent);
        // Would make POST request to /api/agents
      }
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to agents tab
      router.push('/competitor-intelligence?tab=agents');
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} agent:`, error);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleStep = (step: 'step1' | 'step2' | 'step3') => {
    setStepsCollapsed(prev => ({
      ...prev,
      [step]: !prev[step]
    }));
  };

  const handleReviewAgent = () => {
    // Show Step 3 when Review is clicked
    setStepsCollapsed(prev => ({
      ...prev,
      step3: false
    }));
    
    // Scroll to Step 3
    setTimeout(() => {
      const step3Element = document.getElementById('step-3');
      step3Element?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }, 300);
  };

  const canCreateAgent = newAgent.name && newAgent.type && newAgent.competitor_ids.length > 0;
  const selectedAgentType = agentTypes.find(t => t.value === newAgent.type);

  const getFieldIndicator = (fieldName: string) => {
    if (aiPopulatedFields.has(fieldName) && !manuallyEditedFields.has(fieldName)) {
      return (
        <div className="flex items-center space-x-1 text-xs text-blue-600">
          <Sparkles className="w-3 h-3" />
          <span>AI Generated</span>
        </div>
      );
    }
    return null;
  };

  const handleFieldEdit = (fieldName: string) => {
    setManuallyEditedFields(prev => new Set([...prev, fieldName]));
  };

  const addSource = () => {
    if (newSource.trim() && !newAgent.sources.includes(newSource.trim())) {
      setNewAgent(prev => ({
        ...prev,
        sources: [...prev.sources, newSource.trim()]
      }));
      setNewSource('');
      handleFieldEdit('sources');
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !newAgent.keywords.includes(newKeyword.trim())) {
      setNewAgent(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
      handleFieldEdit('keywords');
    }
  };

  const addTrigger = () => {
    if (newTrigger.trim() && !newAgent.notification_triggers.includes(newTrigger.trim().toLowerCase().replace(/\s+/g, '_'))) {
      setNewAgent(prev => ({
        ...prev,
        notification_triggers: [...prev.notification_triggers, newTrigger.trim().toLowerCase().replace(/\s+/g, '_')]
      }));
      setNewTrigger('');
      handleFieldEdit('notification_triggers');
    }
  };

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Filter and search competitors
  const filteredCompetitors = competitors.filter(competitor => {
    const matchesSearch = competitor.name.toLowerCase().includes(competitorSearch.toLowerCase()) ||
                         competitor.industry.toLowerCase().includes(competitorSearch.toLowerCase());
    
    return matchesSearch;
  });

  // Filter monitor types
  const filteredMonitorTypes = monitorTypeFilter === 'all' 
    ? agentTypes 
    : agentTypes.filter(type => type.category === monitorTypeFilter);

  // Get competitor recommendations based on agent type
  const getCompetitorRecommendations = (agentType: string) => {
    // In a real app, this would use AI/ML to recommend competitors
    // For now, return all active competitors as recommendations
    return competitors.filter(c => c.status === 'active').slice(0, 3);
  };

  return (
    <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="calendly-card-static" style={{ marginBottom: '24px', padding: '24px' }}>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/agents')}
                className="p-2 rounded-lg transition-colors"
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
              <div>
                <h1 className="calendly-h1" style={{ marginBottom: '8px' }}>
                  {isEditMode ? 'Edit AI Agent' : 'Create AI Agent'}
                </h1>
                <p className="calendly-body">
                  {isEditMode ? 'Update agent configuration and monitoring settings' : 'Set up AI-powered competitor intelligence monitoring'}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps - Hidden for cleaner UI */}
          {false && (
          <div className="flex items-center space-x-4 mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                researchComplete || (newAgent.name && newAgent.type && newAgent.competitor_ids.length > 0)
                  ? 'bg-green-500 text-white' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
              }`}>
                {researchComplete || (newAgent.name && newAgent.type && newAgent.competitor_ids.length > 0) ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Agent Setup</p>
                <p className="text-xs text-gray-500">Name, type, and competitors</p>
              </div>
            </div>
            
            <div className={`w-12 h-1 rounded ${
              researchComplete ? 'bg-green-500' : 'bg-gray-200'
            }`} />
            
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                researchComplete
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {researchComplete ? <CheckCircle className="w-4 h-4" /> : '2'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">AI Configuration</p>
                <p className="text-xs text-gray-500">Sources, keywords & settings</p>
              </div>
            </div>

            <div className={`w-12 h-1 rounded ${
              researchComplete && canCreateAgent ? 'bg-green-500' : 'bg-gray-200'
            }`} />
            
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                researchComplete && canCreateAgent
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {researchComplete && canCreateAgent ? '3' : '3'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Review & Create</p>
                <p className="text-xs text-gray-500">Finalize and deploy agent</p>
              </div>
            </div>
          </div>
          )}

          {/* Agent Configuration Step */}
          <div ref={step1Ref} className="calendly-card-static" style={{ marginBottom: '24px' }}>
            <div className="p-6">
              <button
                onClick={() => toggleStep('step1')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="calendly-h3">Step 1: Agent Configuration</h2>
                    <p className="text-sm text-gray-600">Define your agent's purpose and monitoring targets</p>
                  </div>
                </div>
                {stepsCollapsed.step1 ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {!stepsCollapsed.step1 && (
                <div className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="calendly-label" style={{ marginBottom: '8px', display: 'block' }}>
                        Agent Name *
                      </label>
                      <input
                        type="text"
                        value={newAgent.name}
                        onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                        className="w-full px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                        style={{ border: '1px solid #e2e8f0', background: 'white' }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4285f4';
                          e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="e.g., Pricing Monitor"
                        disabled={isResearching}
                      />
                    </div>
                    <div>
                      <label className="calendly-label" style={{ marginBottom: '8px', display: 'block' }}>
                        Description
                      </label>
                      <input
                        type="text"
                        value={newAgent.description}
                        onChange={(e) => {
                          setNewAgent({...newAgent, description: e.target.value});
                          handleFieldEdit('description');
                        }}
                        className="w-full px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                        style={{ border: '1px solid #e2e8f0', background: 'white' }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4285f4';
                          e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="Brief description of what this agent monitors"
                        disabled={isResearching}
                      />
                      {getFieldIndicator('description')}
                    </div>
                  </div>

                  {/* Monitoring Type Selection */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Target className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <h2 className="calendly-h3">Choose Monitoring Type</h2>
                        <p className="text-sm text-gray-600">Select the type of intelligence monitoring for your competitor analysis</p>
                      </div>
                    </div>

                    {/* Category Quick Filters */}
                    <div className="mb-6">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setMonitorTypeFilter('all')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            monitorTypeFilter === 'all'
                              ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                              : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                          }`}
                          disabled={isResearching}
                        >
                          All Categories ({agentTypes.length})
                        </button>
                        <button
                          onClick={() => setMonitorTypeFilter('business')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            monitorTypeFilter === 'business'
                              ? 'bg-green-100 text-green-700 border-2 border-green-300'
                              : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                          }`}
                          disabled={isResearching}
                        >
                          Business ({agentTypes.filter(t => t.category === 'business').length})
                        </button>
                        <button
                          onClick={() => setMonitorTypeFilter('product')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            monitorTypeFilter === 'product'
                              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                              : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                          }`}
                          disabled={isResearching}
                        >
                          Product ({agentTypes.filter(t => t.category === 'product').length})
                        </button>
                        <button
                          onClick={() => setMonitorTypeFilter('market')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            monitorTypeFilter === 'market'
                              ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                              : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                          }`}
                          disabled={isResearching}
                        >
                          Market ({agentTypes.filter(t => t.category === 'market').length})
                        </button>
                        <button
                          onClick={() => setMonitorTypeFilter('intelligence')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            monitorTypeFilter === 'intelligence'
                              ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                              : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                          }`}
                          disabled={isResearching}
                        >
                          Intelligence ({agentTypes.filter(t => t.category === 'intelligence').length})
                        </button>
                      </div>
                    </div>

                    {/* Monitor Types Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredMonitorTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = newAgent.type === type.value;
                        
                        return (
                          <button
                            key={type.value}
                            onClick={() => setNewAgent({...newAgent, type: type.value as any})}
                            className={`p-4 rounded-lg border-2 text-left transition-all relative ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                            disabled={isResearching}
                          >
                            {/* Priority Badge */}
                            {type.priority === 'high' && (
                              <div className="absolute top-2 right-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                High
                              </div>
                            )}
                            {type.priority === 'medium' && (
                              <div className="absolute top-2 right-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                                Medium
                              </div>
                            )}
                            {type.priority === 'low' && (
                              <div className="absolute top-2 right-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                Low
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isSelected ? 'bg-indigo-100' : 'bg-gray-100'
                              }`}>
                                <Icon className={`w-4 h-4 ${
                                  isSelected ? 'text-indigo-600' : 'text-gray-600'
                                }`} />
                              </div>
                              <div className="font-semibold text-gray-900">{type.label}</div>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">{type.description}</div>
                            <div className="text-xs text-gray-500">
                              Examples: {type.examples.slice(0, 2).join(', ')}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Competitor Selection - Only show when monitoring type is selected */}
                  {newAgent.type && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <h2 className="calendly-h3">Select Competitors</h2>
                          <p className="text-sm text-gray-600">Choose which competitors to monitor for {agentTypes.find(t => t.value === newAgent.type)?.label.toLowerCase()}</p>
                        </div>
                      </div>

                      {/* Search and Controls */}
                      <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        {/* Search Bar */}
                        <div className="flex-1">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Globe className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              value={competitorSearch}
                              onChange={(e) => setCompetitorSearch(e.target.value)}
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                              placeholder="Search competitors or industries..."
                              disabled={isResearching}
                            />
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">
                            {newAgent.competitor_ids.length} selected
                          </span>
                          {newAgent.competitor_ids.length > 0 && (
                            <button
                              onClick={() => setNewAgent({...newAgent, competitor_ids: []})}
                              className="text-sm text-red-600 hover:text-red-800 font-medium"
                              disabled={isResearching}
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Competitors Grid */}
                      <div className="max-h-96 overflow-y-auto">
                        {filteredCompetitors.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCompetitors.map((competitor) => {
                              const isSelected = newAgent.competitor_ids.includes(competitor.id);
                              const isRecommended = getCompetitorRecommendations(newAgent.type).find(r => r.id === competitor.id);
                              
                              return (
                                <button
                                  key={competitor.id}
                                  onClick={() => {
                                    if (isSelected) {
                                      setNewAgent({...newAgent, competitor_ids: newAgent.competitor_ids.filter(id => id !== competitor.id)});
                                    } else {
                                      setNewAgent({...newAgent, competitor_ids: [...newAgent.competitor_ids, competitor.id]});
                                    }
                                  }}
                                  className={`p-4 rounded-lg border-2 text-left transition-all relative ${
                                    isSelected
                                      ? 'border-indigo-500 bg-indigo-50'
                                      : 'border-gray-200 bg-white hover:border-gray-300'
                                  }`}
                                  disabled={isResearching}
                                >
                                  {/* Recommended Badge */}
                                  {isRecommended && (
                                    <div className="absolute top-2 right-2 flex items-center space-x-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                      <Sparkles className="w-3 h-3" />
                                      <span>Recommended</span>
                                    </div>
                                  )}
                                  
                                  
                                  <div className="flex items-center space-x-3 mb-2">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 flex-shrink-0">
                                      <img src={competitor.logo} alt={competitor.name} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-gray-900">{competitor.name}</div>
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-600 mb-2">{competitor.industry}</div>
                                  <div className="text-xs text-gray-500">
                                    {competitor.website}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Globe className="w-12 h-12 mb-4 text-gray-400" />
                            <p className="text-lg font-medium">No competitors found</p>
                            <p className="text-sm">Try adjusting your search or filter</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* AI Configuration Button */}
                  {!isEditMode && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                            <Sparkles className="w-5 h-5 text-blue-600" />
                            <span>AI Configuration</span>
                          </h3>
                          <p className="text-sm text-gray-600">Let AI configure optimal settings for your monitoring type and competitors</p>
                        </div>
                        <button
                          onClick={handleAIConfiguration}
                          disabled={!newAgent.name || !newAgent.type || newAgent.competitor_ids.length === 0 || isResearching}
                          className="calendly-btn-primary flex items-center space-x-3"
                        >
                          {isResearching ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Configuring...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              <span>Configure with AI</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* AI Configuration Results */}
          {(researchComplete || isEditMode) && (
            <div ref={aiConfigRef} className="calendly-card-static" style={{ marginBottom: '24px' }}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="calendly-h3">Step 2: AI Configuration Results</h2>
                      <p className="text-sm text-gray-600">Review and customize your agent settings</p>
                    </div>
                  </div>
                  {/* Regenerate Button */}
                  <button
                    onClick={() => handleAIConfiguration()}
                    disabled={!newAgent.name || !newAgent.type || newAgent.competitor_ids.length === 0 || isResearching}
                    className="calendly-btn-primary flex items-center space-x-2"
                    title="Regenerate AI configuration based on current monitoring type and competitors"
                  >
                    {isResearching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Regenerating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Regenerate</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6">
                <div className="space-y-6">
                  {/* Data Sources */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="calendly-label" style={{ display: 'block' }}>Data Sources</label>
                      {getFieldIndicator('sources')}
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newSource}
                          onChange={(e) => setNewSource(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSource()}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          placeholder="Add custom data source (e.g., company blog, pricing page...)"
                        />
                        <button
                          onClick={addSource}
                          className="calendly-btn-primary"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <button
                        onClick={() => setShowSourceLibrary(!showSourceLibrary)}
                        className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <Library className="w-4 h-4" />
                        <span>{showSourceLibrary ? 'Hide' : 'Browse'} Source Library ({ALL_SOURCES.length} options)</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showSourceLibrary ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showSourceLibrary && (
                        <div className="mt-3 border border-gray-200 rounded-lg bg-white shadow-sm">
                          {/* Modern Header */}
                          <div className="p-4 bg-blue-50 border-blue-200 rounded-t-lg border-b">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-sm font-semibold text-blue-600">
                                  Data Source Categories
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">Select data sources to monitor for intelligence gathering</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-500">
                                  {newAgent.sources.length} of {ALL_SOURCES.length} selected
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Categories */}
                          <div className="max-h-64 overflow-y-auto">
                            {Object.entries(DATA_SOURCE_CATEGORIES).map(([categoryName, sources]) => {
                              const categorySelected = sources.filter(source => newAgent.sources.includes(source)).length;
                              
                              return (
                                <div key={categoryName} className="border-t border-gray-100 first:border-t-0">
                                  <div className="p-3 bg-gray-50/50">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-sm font-medium text-gray-700">{categoryName}</h4>
                                      <span className="text-xs text-gray-500">
                                        {categorySelected}/{sources.length} selected
                                      </span>
                                    </div>
                                  </div>
                                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {sources.map((source) => {
                                      const isSelected = newAgent.sources.includes(source);
                                      return (
                                        <label
                                          key={source}
                                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {
                                              if (isSelected) {
                                                setNewAgent(prev => ({
                                                  ...prev,
                                                  sources: prev.sources.filter(s => s !== source)
                                                }));
                                              } else {
                                                setNewAgent(prev => ({
                                                  ...prev,
                                                  sources: [...prev.sources, source]
                                                }));
                                              }
                                              handleFieldEdit('sources');
                                            }}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-0"
                                          />
                                          <span className={`text-sm ${isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                            {source}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {newAgent.sources.map((source, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {source}
                          <button
                            onClick={() => {
                              setNewAgent(prev => ({
                                ...prev,
                                sources: prev.sources.filter((_, i) => i !== index)
                              }));
                              handleFieldEdit('sources');
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Monitoring Keywords */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="calendly-label" style={{ display: 'block' }}>Monitoring Keywords</label>
                      {getFieldIndicator('keywords')}
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          placeholder="Add custom monitoring keyword (e.g., pricing, new feature, partnership...)"
                        />
                        <button
                          onClick={addKeyword}
                          className="calendly-btn-primary"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <button
                        onClick={() => setShowKeywordLibrary(!showKeywordLibrary)}
                        className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <Library className="w-4 h-4" />
                        <span>{showKeywordLibrary ? 'Hide' : 'Browse'} Keyword Library ({ALL_KEYWORDS.length} options)</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showKeywordLibrary ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showKeywordLibrary && (
                        <div className="mt-3 border border-gray-200 rounded-lg bg-white shadow-sm">
                          {/* Modern Header */}
                          <div className="p-4 bg-green-50 border-green-200 rounded-t-lg border-b">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-sm font-semibold text-green-600">
                                  Monitoring Keywords
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">Select keywords to trigger intelligent monitoring alerts</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-500">
                                  {newAgent.keywords.length} of {ALL_KEYWORDS.length} selected
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Categories */}
                          <div className="max-h-64 overflow-y-auto">
                            {Object.entries(KEYWORD_CATEGORIES).map(([categoryName, keywords]) => {
                              const categorySelected = keywords.filter(keyword => newAgent.keywords.includes(keyword)).length;
                              
                              return (
                                <div key={categoryName} className="border-t border-gray-100 first:border-t-0">
                                  <div className="p-3 bg-gray-50/50">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-sm font-medium text-gray-700">{categoryName}</h4>
                                      <span className="text-xs text-gray-500">
                                        {categorySelected}/{keywords.length} selected
                                      </span>
                                    </div>
                                  </div>
                                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {keywords.map((keyword) => {
                                      const isSelected = newAgent.keywords.includes(keyword);
                                      return (
                                        <label
                                          key={keyword}
                                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {
                                              if (isSelected) {
                                                setNewAgent(prev => ({
                                                  ...prev,
                                                  keywords: prev.keywords.filter(k => k !== keyword)
                                                }));
                                              } else {
                                                setNewAgent(prev => ({
                                                  ...prev,
                                                  keywords: [...prev.keywords, keyword]
                                                }));
                                              }
                                              handleFieldEdit('keywords');
                                            }}
                                            className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2 focus:ring-offset-0"
                                          />
                                          <span className={`text-sm ${isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                            {keyword}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Selected Keywords Pills */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {newAgent.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          {keyword}
                          <button
                            onClick={() => {
                              setNewAgent(prev => ({
                                ...prev,
                                keywords: prev.keywords.filter((_, i) => i !== index)
                              }));
                              handleFieldEdit('keywords');
                            }}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Notification Triggers */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="calendly-label" style={{ display: 'block' }}>Alert Triggers</label>
                      {getFieldIndicator('notification_triggers')}
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newTrigger}
                          onChange={(e) => setNewTrigger(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTrigger()}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          placeholder="Add custom alert trigger (e.g., price_change, new_feature, executive_hire...)"
                        />
                        <button
                          onClick={addTrigger}
                          className="calendly-btn-secondary"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3">
                      <button
                        onClick={() => setShowTriggerLibrary(!showTriggerLibrary)}
                        className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <Library className="w-4 h-4" />
                        <span>{showTriggerLibrary ? 'Hide' : 'Browse'} Trigger Library ({ALL_TRIGGERS.length} options)</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showTriggerLibrary ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {showTriggerLibrary && (
                        <div className="mt-3 border border-gray-200 rounded-lg bg-white shadow-sm">
                          {/* Modern Header */}
                          <div className="p-4 bg-orange-50 border-orange-200 rounded-t-lg border-b">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-sm font-semibold text-orange-600">
                                  Alert Trigger Categories
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">Configure when notifications should be sent for detected changes</p>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-500">
                                  {newAgent.notification_triggers.length} of {ALL_TRIGGERS.length} selected
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Categories */}
                          <div className="max-h-64 overflow-y-auto">
                            {Object.entries(TRIGGER_CATEGORIES).map(([categoryName, triggers]) => {
                              const categorySelected = triggers.filter(trigger => newAgent.notification_triggers.includes(trigger)).length;
                              
                              return (
                                <div key={categoryName} className="border-t border-gray-100 first:border-t-0">
                                  <div className="p-3 bg-gray-50/50">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-sm font-medium text-gray-700">{categoryName}</h4>
                                      <span className="text-xs text-gray-500">
                                        {categorySelected}/{triggers.length} selected
                                      </span>
                                    </div>
                                  </div>
                                  <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {triggers.map((trigger) => {
                                      const isSelected = newAgent.notification_triggers.includes(trigger);
                                      return (
                                        <label
                                          key={trigger}
                                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {
                                              if (isSelected) {
                                                setNewAgent(prev => ({
                                                  ...prev,
                                                  notification_triggers: prev.notification_triggers.filter(t => t !== trigger)
                                                }));
                                              } else {
                                                setNewAgent(prev => ({
                                                  ...prev,
                                                  notification_triggers: [...prev.notification_triggers, trigger]
                                                }));
                                              }
                                              handleFieldEdit('notification_triggers');
                                            }}
                                            className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2 focus:ring-offset-0"
                                          />
                                          <span className={`text-sm ${isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                            {trigger.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Selected Triggers Pills */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {newAgent.notification_triggers.map((trigger, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800"
                        >
                          {trigger.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          <button
                            onClick={() => {
                              setNewAgent(prev => ({
                                ...prev,
                                notification_triggers: prev.notification_triggers.filter((_, i) => i !== index)
                              }));
                              handleFieldEdit('notification_triggers');
                            }}
                            className="ml-2 text-orange-600 hover:text-orange-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="calendly-label" style={{ marginBottom: '8px', display: 'block' }}>
                        Monitoring Schedule
                      </label>
                      <select
                        value={newAgent.schedule}
                        onChange={(e) => {
                          setNewAgent({...newAgent, schedule: e.target.value as any});
                          handleFieldEdit('schedule');
                        }}
                        className="w-full px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                        style={{ border: '1px solid #e2e8f0', background: 'white' }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4285f4';
                          e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="hourly">Every Hour</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="on_trigger">On Trigger</option>
                      </select>
                    </div>

                    <div>
                      <label className="calendly-label" style={{ marginBottom: '8px', display: 'block' }}>
                        Data Retention (Days)
                      </label>
                      <input
                        type="number"
                        value={newAgent.data_retention_days}
                        onChange={(e) => {
                          setNewAgent({...newAgent, data_retention_days: parseInt(e.target.value) || 90});
                          handleFieldEdit('data_retention_days');
                        }}
                        className="w-full px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                        style={{ border: '1px solid #e2e8f0', background: 'white' }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4285f4';
                          e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                        min="7"
                        max="365"
                      />
                    </div>
                  </div>

                  {/* Feature Toggles */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="sentiment_tracking"
                        checked={newAgent.sentiment_tracking}
                        onChange={(e) => {
                          setNewAgent({...newAgent, sentiment_tracking: e.target.checked});
                          handleFieldEdit('sentiment_tracking');
                        }}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <label htmlFor="sentiment_tracking" className="text-sm font-medium text-gray-700">
                        Enable sentiment analysis tracking
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="deep_analysis"
                        checked={newAgent.deep_analysis}
                        onChange={(e) => {
                          setNewAgent({...newAgent, deep_analysis: e.target.checked});
                          handleFieldEdit('deep_analysis');
                        }}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <label htmlFor="deep_analysis" className="text-sm font-medium text-gray-700">
                        Enable deep analysis and insights extraction
                      </label>
                    </div>
                  </div>

                  {/* Price Threshold for Pricing Agents */}
                  {newAgent.type === 'pricing' && (
                    <div>
                      <label className="calendly-label" style={{ marginBottom: '8px', display: 'block' }}>
                        Price Change Threshold (%)
                      </label>
                      <input
                        type="number"
                        value={newAgent.price_threshold || ''}
                        onChange={(e) => {
                          setNewAgent({...newAgent, price_threshold: parseFloat(e.target.value) || undefined});
                          handleFieldEdit('price_threshold');
                        }}
                        className="w-full px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                        style={{ border: '1px solid #e2e8f0', background: 'white' }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4285f4';
                          e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="5"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Only notify when price changes exceed this threshold</p>
                    </div>
                  )}

                  {/* Review Button */}
                  <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleReviewAgent}
                      className="calendly-btn-primary flex items-center space-x-2"
                    >
                      <Eye className="w-5 h-5" />
                      <span>Review Agent Configuration</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Create */}
          {(researchComplete || isEditMode) && (isEditMode || !stepsCollapsed.step3) && (
            <div id="step-3" className="calendly-card-static" style={{ marginBottom: '24px' }}>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="calendly-h3">Step 3: Review & Create</h2>
                    <p className="text-sm text-gray-600">Review your agent configuration and deploy</p>
                  </div>
                </div>

                {/* Agent Summary */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-4 mb-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedAgentType?.color || 'bg-gray-100'}`}>
                      {selectedAgentType && (() => {
                        const IconComponent = selectedAgentType.icon;
                        return <IconComponent className="w-4 h-4" />;
                      })()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{newAgent.name || 'Unnamed Agent'}</h3>
                      <p className="text-sm text-gray-600">{selectedAgentType?.label}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{newAgent.description}</p>
                </div>

                {/* Configuration Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900">Competitors</span>
                    </div>
                    <p className="text-sm text-gray-600">{newAgent.competitor_ids.length} selected</p>
                    <div className="mt-2 space-y-1">
                      {competitors.filter(c => newAgent.competitor_ids.includes(c.id)).map(competitor => (
                        <div key={competitor.id} className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded overflow-hidden bg-gray-100">
                            <img src={competitor.logo} alt={competitor.name} className="w-full h-full object-contain" />
                          </div>
                          <span className="text-xs text-gray-600">{competitor.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Globe className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-900">Sources</span>
                    </div>
                    <p className="text-sm text-gray-600">{newAgent.sources.length} configured</p>
                    <div className="mt-1 text-xs text-gray-500">
                      {newAgent.sources.slice(0, 3).join(', ')}
                      {newAgent.sources.length > 3 && ` +${newAgent.sources.length - 3} more`}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-gray-900">Schedule</span>
                    </div>
                    <p className="text-sm text-gray-600 capitalize">{newAgent.schedule}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {newAgent.schedule === 'hourly' && 'Checks every hour'}
                      {newAgent.schedule === 'daily' && 'Checks once per day'}
                      {newAgent.schedule === 'weekly' && 'Checks once per week'}
                      {newAgent.schedule === 'monthly' && 'Checks once per month'}
                      {newAgent.schedule === 'on_trigger' && 'Triggered by events'}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-gray-900">Keywords</span>
                    </div>
                    <p className="text-sm text-gray-600">{newAgent.keywords.length} tracking</p>
                    <div className="mt-1 text-xs text-gray-500">
                      {newAgent.keywords.slice(0, 3).join(', ')}
                      {newAgent.keywords.length > 3 && ` +${newAgent.keywords.length - 3} more`}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Bell className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-gray-900">Alerts</span>
                    </div>
                    <p className="text-sm text-gray-600">{newAgent.notification_triggers.length} triggers</p>
                    <div className="mt-1 text-xs text-gray-500">
                      {newAgent.notification_triggers.slice(0, 2).join(', ')}
                      {newAgent.notification_triggers.length > 2 && ` +${newAgent.notification_triggers.length - 2} more`}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-gray-900">Retention</span>
                    </div>
                    <p className="text-sm text-gray-600">{newAgent.data_retention_days} days</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${newAgent.sentiment_tracking ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-500">Sentiment</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${newAgent.deep_analysis ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-500">Deep Analysis</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Action */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <Zap className="w-5 h-5 text-indigo-600" />
                        <span>{isEditMode ? 'Ready to Save Changes?' : 'Ready to Deploy AI Agent?'}</span>
                      </h3>
                      <p className="text-sm text-gray-600">
                        {isEditMode 
                          ? 'This will update your agent configuration and restart monitoring' 
                          : 'This will start monitoring your selected competitors automatically'
                        }
                      </p>
                      {!isEditMode && (
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>✓ Real-time monitoring</span>
                          <span>✓ Intelligent alerts</span>
                          <span>✓ Historical data</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleSaveAgent}
                      disabled={!canCreateAgent || isCreating}
                      className="calendly-btn-primary flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          <span>{isEditMode ? 'Save Changes' : 'Create AI Agent'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}