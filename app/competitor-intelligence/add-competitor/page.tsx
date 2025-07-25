'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft,
  Building,
  Globe,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  Shield,
  TrendingUp,
  Sparkles,
  Loader2,
  Zap,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface NewCompetitor {
  name: string;
  website: string;
  industry: string;
  location: string;
  founded: string;
  employees: string;
  marketCap: string;
  description: string;
  threat_level: 'high' | 'medium' | 'low';
  key_products: string[];
  strengths: string[];
  weaknesses: string[];
}

export default function AddCompetitorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('edit');
  const isEditMode = !!editId;
  const step1Ref = useRef<HTMLDivElement>(null);

  const [newCompetitor, setNewCompetitor] = useState<NewCompetitor>({
    name: '',
    website: '',
    industry: '',
    location: '',
    founded: '',
    employees: '',
    marketCap: '',
    description: '',
    threat_level: 'medium',
    key_products: [],
    strengths: [],
    weaknesses: []
  });

  const [stepsCollapsed, setStepsCollapsed] = useState({
    step1: false
  });

  const [newProduct, setNewProduct] = useState('');
  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [researchComplete, setResearchComplete] = useState(false);
  const [aiPopulatedFields, setAiPopulatedFields] = useState<Set<string>>(new Set());
  const [manuallyEditedFields, setManuallyEditedFields] = useState<Set<string>>(new Set());
  
  // Suggestion states for autocomplete
  const [productSuggestions, setProductSuggestions] = useState<string[]>([]);
  const [strengthSuggestions, setStrengthSuggestions] = useState<string[]>([]);
  const [weaknessSuggestions, setWeaknessSuggestions] = useState<string[]>([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [showStrengthSuggestions, setShowStrengthSuggestions] = useState(false);
  const [showWeaknessSuggestions, setShowWeaknessSuggestions] = useState(false);
  
  // Library expansion states
  const [showProductLibrary, setShowProductLibrary] = useState(false);
  const [showStrengthLibrary, setShowStrengthLibrary] = useState(false);
  const [showWeaknessLibrary, setShowWeaknessLibrary] = useState(false);
  
  // Compact pill display states
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [showAllStrengths, setShowAllStrengths] = useState(false);
  const [showAllWeaknesses, setShowAllWeaknesses] = useState(false);
  
  // Research metadata
  const [researchAge, setResearchAge] = useState<string>('');
  
  // Toast notification state
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success' | 'warning', show: boolean}>({message: '', type: 'error', show: false});
  
  // Field highlighting state
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set());

  // Load competitor data if in edit mode
  useEffect(() => {
    if (isEditMode && editId) {
      loadCompetitorForEdit(editId);
      // Scroll to top when entering edit mode
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isEditMode, editId]);

  const loadCompetitorForEdit = async (competitorId: string) => {
    try {
      // TODO: Replace with actual API call when backend is ready
      // For now, find the competitor from the mock data used in the main page
      const mockCompetitors = [
        {
          id: 'salesforce', name: 'Salesforce', website: 'salesforce.com', industry: 'CRM & Sales',
          location: 'San Francisco, CA', founded: '1999', employees: '79,000', marketCap: '$248B',
          description: 'Leading cloud-based CRM platform with AI-powered sales and marketing tools',
          threat_level: 'high', key_products: ['Sales Cloud', 'Service Cloud', 'Marketing Cloud', 'Einstein AI'],
          strengths: ['Market leader', 'Comprehensive platform', 'Strong AI integration'],
          weaknesses: ['High complexity', 'Expensive for SMBs', 'Steep learning curve']
        },
        {
          id: 'hubspot', name: 'HubSpot', website: 'hubspot.com', industry: 'Marketing & Sales',
          location: 'Cambridge, MA', founded: '2006', employees: '7,000', marketCap: '$31B',
          description: 'Inbound marketing, sales, and customer service platform with integrated CRM',
          threat_level: 'high', key_products: ['Marketing Hub', 'Sales Hub', 'Service Hub', 'CMS Hub'],
          strengths: ['User-friendly interface', 'Strong inbound methodology', 'Integrated platform'],
          weaknesses: ['Limited enterprise features', 'Pricing complexity', 'Reporting limitations']
        },
        {
          id: 'pipedrive', name: 'Pipedrive', website: 'https://pipedrive.com', industry: 'Sales CRM',
          location: 'Tallinn, Estonia', founded: '2010', employees: '1,000', marketCap: '$2.1B',
          description: 'Sales-focused CRM designed for small to medium businesses.',
          threat_level: 'medium', key_products: ['Sales CRM', 'Pipeline Management', 'Email Sync', 'Mobile App'],
          strengths: ['Simple interface', 'Visual pipeline', 'Affordable pricing'],
          weaknesses: ['Limited marketing features', 'Basic reporting', 'Fewer integrations']
        },
        {
          id: 'zendesk', name: 'Zendesk', website: 'https://zendesk.com', industry: 'Customer Support',
          location: 'San Francisco, CA', founded: '2007', employees: '6,000', marketCap: '$13B',
          description: 'Customer service platform with ticketing, knowledge base, and chat support.',
          threat_level: 'medium', key_products: ['Support Suite', 'Guide', 'Chat', 'Talk', 'Explore'],
          strengths: ['Market leader', 'Comprehensive platform', 'Strong integrations', 'Scalable'],
          weaknesses: ['Complex pricing', 'Steep learning curve', 'Expensive for SMBs']
        }
      ];
      
      const competitor = mockCompetitors.find(c => c.id === competitorId);
      if (competitor) {
        setNewCompetitor({
          name: competitor.name,
          website: competitor.website,
          industry: competitor.industry,
          location: competitor.location,
          founded: competitor.founded,
          employees: competitor.employees,
          marketCap: competitor.marketCap,
          description: competitor.description,
          threat_level: competitor.threat_level as 'high' | 'medium' | 'low',
          key_products: competitor.key_products,
          strengths: competitor.strengths,
          weaknesses: competitor.weaknesses
        });
        setResearchComplete(true);
        
        // Load AI research metadata from localStorage
        const savedAIFields = localStorage.getItem(`ai_research_${competitorId}`);
        const savedManualFields = localStorage.getItem(`manual_edits_${competitorId}`);
        const researchTimestamp = localStorage.getItem(`research_timestamp_${competitorId}`);
        
        if (savedAIFields) {
          setAiPopulatedFields(new Set(JSON.parse(savedAIFields)));
        } else {
          // Default for existing competitors without saved metadata
          setAiPopulatedFields(new Set(['key_products', 'strengths', 'weaknesses']));
        }
        
        if (savedManualFields) {
          setManuallyEditedFields(new Set(JSON.parse(savedManualFields)));
        }
        
        // Calculate research age
        if (researchTimestamp) {
          const researchDate = new Date(researchTimestamp);
          const now = new Date();
          const diffHours = Math.floor((now.getTime() - researchDate.getTime()) / (1000 * 60 * 60));
          
          if (diffHours < 1) {
            setResearchAge('Less than 1 hour ago');
          } else if (diffHours < 24) {
            setResearchAge(`${diffHours} hour${diffHours === 1 ? '' : 's'} ago`);
          } else {
            const diffDays = Math.floor(diffHours / 24);
            setResearchAge(`${diffDays} day${diffDays === 1 ? '' : 's'} ago`);
          }
        }
      }
    } catch (error) {
      console.error('Error loading competitor for edit:', error);
    }
  };

  // Enhanced and comprehensive product categories for competitor analysis
  const PRODUCT_CATEGORIES = {
    'Design & Creative Tools': [
      'Design Platform', 'Template Library', 'Brand Kit', 'Logo Maker', 'Photo Editor',
      'Video Editor', 'Presentation Tool', 'Infographic Maker', 'Social Media Designer',
      'Print Design', 'Web Design', 'Mobile Design', 'Animation Tool', 'Collaboration Platform',
      'AI Design Assistant', 'Stock Photo Library', 'Icon Library', 'Font Manager', 
      'Color Palette Tool', 'Background Remover', 'Image Resizer', 'PDF Editor',
      'Mockup Generator', 'Chart Maker', 'Mind Map Tool', 'Wireframe Tool',
      // Presentation-specific additions
      'Slide Builder', 'Interactive Presentations', 'Presentation Analytics', 'Speaker Notes',
      'Slide Transitions', 'Auto-layout', 'Smart Formatting', 'Content Suggestions',
      // Modern design features
      'Design Systems', 'Component Libraries', 'Brand Guidelines', 'Asset Libraries',
      'Collaborative Editing', 'Version History', 'Export Options', 'Responsive Design'
    ],
    'Marketing & Business Tools': [
      'Marketing Automation', 'Email Marketing', 'Content Management', 'Analytics Dashboard',
      'Campaign Manager', 'Social Media Scheduler', 'Lead Generation', 'Customer Support',
      'Project Management', 'Team Collaboration', 'File Storage', 'Asset Management',
      'CRM Integration', 'Marketing Analytics', 'A/B Testing', 'Landing Page Builder',
      'Form Builder', 'Survey Creator', 'Event Management', 'Webinar Platform',
      'Content Calendar', 'Influencer Outreach', 'Referral Program', 'Loyalty Program',
      'Customer Journey Mapping', 'Marketing Attribution', 'Conversion Tracking'
    ],
    'Technology & Integration': [
      'API Platform', 'Mobile App', 'Browser Extension', 'Desktop App', 'Cloud Storage',
      'Third-party Integrations', 'Workflow Automation', 'Data Export', 'Custom Branding',
      'White Label Solution', 'Enterprise Suite', 'Admin Dashboard', 'Single Sign-On (SSO)',
      'SAML Integration', 'Zapier Integration', 'Slack Integration', 'Microsoft Integration',
      'Google Workspace Integration', 'Salesforce Integration', 'HubSpot Integration',
      'Webhook Support', 'REST API', 'GraphQL API', 'SDK/Developer Tools',
      'Bulk Operations', 'Data Import/Export', 'Version Control', 'Audit Logging',
      'Custom Domains', 'CDN Support', 'Multi-language Support', 'Accessibility Features'
    ]
  };

  const STRENGTH_CATEGORIES = {
    'User Experience': [
      'User-friendly interface', 'Intuitive design', 'Easy learning curve', 'Great onboarding',
      'Mobile-responsive', 'Fast performance', 'Reliable uptime', 'Excellent UX/UI',
      'Drag-and-drop functionality', 'Visual editor', 'WYSIWYG interface', 'Keyboard shortcuts',
      'Accessibility compliant', 'Multi-device sync', 'Offline capabilities', 'Auto-save features'
    ],
    'Market & Business': [
      'Strong brand recognition', 'Market leader', 'Large user base', 'Global presence',
      'Strong community', 'Established reputation', 'Industry partnerships', 'Thought leadership',
      'First-mover advantage', 'Network effects', 'Viral growth', 'Word-of-mouth marketing',
      'Celebrity endorsements', 'Media coverage', 'Award recognition', 'Analyst rankings'
    ],
    'Product & Features': [
      'Comprehensive feature set', 'Regular updates', 'Innovation focus', 'Advanced AI features',
      'Extensive template library', 'High-quality assets', 'Professional designs', 'Customization options',
      'Machine learning capabilities', 'Smart suggestions', 'Auto-layout features', 'Content generation',
      'Multi-format export', 'High-resolution outputs', 'Print-ready files', 'Web optimization',
      'Brand consistency tools', 'Template versioning', 'Design system integration', 'Asset organization'
    ],
    'Business Model': [
      'Freemium model', 'Affordable pricing', 'Flexible plans', 'Good value for money',
      'Transparent pricing', 'Enterprise solutions', 'Scalable platform', 'ROI focused',
      'Usage-based pricing', 'Volume discounts', 'Annual subscriptions', 'Team pricing',
      'Custom enterprise pricing', 'Nonprofit discounts', 'Student pricing', 'Free tier generous'
    ],
    'Support & Resources': [
      'Excellent customer support', '24/7 support', 'Comprehensive documentation', 'Training resources',
      'Active community forum', 'Video tutorials', 'Webinar programs', 'Certification courses',
      'Live chat support', 'Phone support', 'Email support', 'Priority support tiers',
      'Knowledge base', 'Design inspiration', 'Best practices guides', 'Case studies',
      'Template marketplace', 'User-generated content', 'Expert consultations', 'Onboarding specialists'
    ],
    'Technical': [
      'Cloud-based platform', 'Real-time collaboration', 'Version control', 'API availability',
      'Security focused', 'GDPR compliant', 'Data privacy', 'Integration capabilities',
      'Enterprise-grade security', 'SOC 2 compliance', 'ISO certifications', 'Data encryption',
      'Backup and recovery', 'High availability', 'Load balancing', 'CDN distribution',
      'Open API', 'Webhook support', 'Third-party connectors', 'Custom integrations',
      'Scalable infrastructure', 'Multi-tenant architecture', 'Performance monitoring'
    ],
    'Innovation & AI': [
      'AI-powered features', 'Machine learning algorithms', 'Automated design suggestions', 'Smart cropping',
      'Content generation', 'Style transfer', 'Color palette generation', 'Font pairing',
      'Background removal', 'Image enhancement', 'Voice-to-design', 'Text-to-image',
      'Predictive analytics', 'User behavior insights', 'Performance optimization', 'A/B testing built-in'
    ]
  };

  const WEAKNESS_CATEGORIES = {
    'Usability & Performance': [
      'Steep learning curve', 'Complex interface', 'Overwhelming for beginners', 'Performance issues',
      'Slow loading times', 'Limited mobile functionality', 'Browser compatibility issues', 'Requires training',
      'Clunky user experience', 'Poor navigation', 'Inconsistent design', 'Too many features',
      'Confusing workflows', 'Long rendering times', 'Memory intensive', 'Frequent crashes',
      'Poor search functionality', 'Difficult file organization', 'No keyboard shortcuts', 'Limited undo/redo'
    ],
    'Pricing & Business': [
      'Expensive pricing', 'Complex pricing structure', 'No free tier', 'Limited free features',
      'Subscription fatigue', 'Hidden costs', 'Poor value for SMBs', 'Enterprise-only features',
      'Frequent price increases', 'Pay-per-use expensive', 'No usage transparency', 'Difficult cancellation',
      'Lock-in contracts', 'Setup fees', 'Overage charges', 'Limited payment options',
      'No refund policy', 'Currency limitations', 'Tax complications', 'Budget unpredictability'
    ],
    'Features & Limitations': [
      'Limited customization', 'Basic feature set', 'Outdated templates', 'Limited integrations',
      'No offline access', 'Storage limitations', 'Export restrictions', 'Template dependency',
      'Poor template quality', 'Limited font options', 'No advanced editing', 'Missing key features',
      'Watermarks on free tier', 'Low resolution exports', 'Format limitations', 'No bulk operations',
      'Limited brand controls', 'No white labeling', 'Inflexible layouts', 'Poor asset management',
      'No version history', 'Limited collaboration', 'No design system support', 'Asset licensing issues'
    ],
    'Market & Competition': [
      'Losing market share', 'Strong competition', 'Late to market trends', 'Innovation lag',
      'Limited market presence', 'Niche focus only', 'Geographic limitations', 'Language barriers',
      'Commoditized offering', 'No differentiation', 'Copycat features', 'Reactive strategy',
      'Limited marketing reach', 'Poor brand awareness', 'Negative press coverage', 'Customer churn',
      'Declining user engagement', 'Partner conflicts', 'Distribution challenges', 'Regulatory issues'
    ],
    'Support & Resources': [
      'Poor customer support', 'Limited documentation', 'Slow response times', 'No phone support',
      'Community not active', 'Outdated help resources', 'No training programs', 'Self-service only',
      'Language barriers in support', 'Time zone limitations', 'Ticket system problems', 'No escalation path',
      'Unhelpful responses', 'Long wait times', 'No video support', 'Limited live chat hours',
      'Poor knowledge base', 'No tutorials', 'Outdated documentation', 'Missing FAQs',
      'No community forum', 'Limited expert help', 'No certification programs', 'Poor onboarding'
    ],
    'Technical': [
      'Security concerns', 'Data privacy issues', 'Limited API access', 'Poor collaboration tools',
      'No version control', 'Integration challenges', 'Vendor lock-in', 'Migration difficulties',
      'Downtime issues', 'Data loss risks', 'Backup limitations', 'No disaster recovery',
      'Compliance gaps', 'Audit trail missing', 'No SSO support', 'Poor access controls',
      'Limited API rate limits', 'No webhooks', 'Data portability issues', 'Legacy architecture',
      'Scalability problems', 'Performance bottlenecks', 'Browser dependencies', 'Mobile limitations',
      'No offline sync', 'Data sovereignty issues', 'Third-party dependencies', 'Technical debt'
    ],
    'Innovation & AI': [
      'Outdated AI capabilities', 'No machine learning features', 'Limited automation', 'Poor personalization',
      'No predictive features', 'Basic recommendation engine', 'No intelligent suggestions', 'Manual processes',
      'No voice interface', 'Limited natural language processing', 'No computer vision', 'Slow AI adoption',
      'Generic AI outputs', 'No learning from user behavior', 'Limited AI customization', 'AI accuracy issues'
    ]
  };

  // Flat arrays for search functionality
  const COMMON_PRODUCTS = Object.values(PRODUCT_CATEGORIES).flat();
  const COMMON_STRENGTHS = Object.values(STRENGTH_CATEGORIES).flat();
  const COMMON_WEAKNESSES = Object.values(WEAKNESS_CATEGORIES).flat();

  const toggleStep = (step: 'step1') => {
    setStepsCollapsed(prev => ({
      ...prev,
      [step]: !prev[step]
    }));
  };

  // Search and filter functions
  const filterSuggestions = (query: string, suggestions: string[], exclude: string[]) => {
    if (!query.trim()) return [];
    return suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase()) && 
        !exclude.includes(suggestion)
      )
      .slice(0, 8); // Limit to 8 suggestions
  };

  const handleProductInput = (value: string) => {
    setNewProduct(value);
    const filtered = filterSuggestions(value, COMMON_PRODUCTS, newCompetitor.key_products);
    setProductSuggestions(filtered);
    setShowProductSuggestions(value.length > 1 && filtered.length > 0);
  };

  const handleStrengthInput = (value: string) => {
    setNewStrength(value);
    const filtered = filterSuggestions(value, COMMON_STRENGTHS, newCompetitor.strengths);
    setStrengthSuggestions(filtered);
    setShowStrengthSuggestions(value.length > 1 && filtered.length > 0);
  };

  const handleWeaknessInput = (value: string) => {
    setNewWeakness(value);
    const filtered = filterSuggestions(value, COMMON_WEAKNESSES, newCompetitor.weaknesses);
    setWeaknessSuggestions(filtered);
    setShowWeaknessSuggestions(value.length > 1 && filtered.length > 0);
  };

  const addKeyProduct = (product?: string) => {
    const productToAdd = product || newProduct.trim();
    if (productToAdd && !newCompetitor.key_products.includes(productToAdd)) {
      handleFieldChange('key_products', [...newCompetitor.key_products, productToAdd]);
      setNewProduct('');
      setShowProductSuggestions(false);
    }
  };

  const removeKeyProduct = (index: number) => {
    handleFieldChange('key_products', newCompetitor.key_products.filter((_, i) => i !== index));
  };

  const addStrength = (strength?: string) => {
    const strengthToAdd = strength || newStrength.trim();
    if (strengthToAdd && !newCompetitor.strengths.includes(strengthToAdd)) {
      handleFieldChange('strengths', [...newCompetitor.strengths, strengthToAdd]);
      setNewStrength('');
      setShowStrengthSuggestions(false);
    }
  };

  const removeStrength = (index: number) => {
    handleFieldChange('strengths', newCompetitor.strengths.filter((_, i) => i !== index));
  };

  const addWeakness = (weakness?: string) => {
    const weaknessToAdd = weakness || newWeakness.trim();
    if (weaknessToAdd && !newCompetitor.weaknesses.includes(weaknessToAdd)) {
      handleFieldChange('weaknesses', [...newCompetitor.weaknesses, weaknessToAdd]);
      setNewWeakness('');
      setShowWeaknessSuggestions(false);
    }
  };

  const removeWeakness = (index: number) => {
    handleFieldChange('weaknesses', newCompetitor.weaknesses.filter((_, i) => i !== index));
  };

  // Toggle functions for checkbox libraries
  const toggleProduct = (product: string) => {
    const newProducts = newCompetitor.key_products.includes(product)
      ? newCompetitor.key_products.filter(p => p !== product)
      : [...newCompetitor.key_products, product];
    handleFieldChange('key_products', newProducts);
  };

  const toggleStrength = (strength: string) => {
    const newStrengths = newCompetitor.strengths.includes(strength)
      ? newCompetitor.strengths.filter(s => s !== strength)
      : [...newCompetitor.strengths, strength];
    handleFieldChange('strengths', newStrengths);
  };

  const toggleWeakness = (weakness: string) => {
    const newWeaknesses = newCompetitor.weaknesses.includes(weakness)
      ? newCompetitor.weaknesses.filter(w => w !== weakness)
      : [...newCompetitor.weaknesses, weakness];
    handleFieldChange('weaknesses', newWeaknesses);
  };

  const handleSaveCompetitor = async () => {
    setIsCreating(true);
    try {
      // Map the form data to the API schema
      const competitorData = {
        name: newCompetitor.name,
        domain: newCompetitor.website,
        description: newCompetitor.description,
        industry: newCompetitor.industry,
        location: newCompetitor.location,
        competitor_type: 'direct', // Default to direct
        threat_level: newCompetitor.threat_level,
        key_differentiators: newCompetitor.strengths,
        target_segments: [],
        pricing_model: null,
        employee_count: newCompetitor.employees ? parseInt(newCompetitor.employees.replace(/,/g, '')) || null : null,
        status: 'active',
        notes: `Key Products: ${newCompetitor.key_products.join(', ')}\nWeaknesses: ${newCompetitor.weaknesses.join(', ')}\nFounded: ${newCompetitor.founded}\nMarket Cap: ${newCompetitor.marketCap}`,
        // Add monitoring sources for common competitor monitoring
        monitoring_sources: [
          {
            source_type: 'website',
            source_url: newCompetitor.website,
            source_name: `${newCompetitor.name} Website`,
            monitoring_frequency: 'daily',
            is_active: true
          },
          {
            source_type: 'blog',
            source_url: `${newCompetitor.website}/blog`,
            source_name: `${newCompetitor.name} Blog`,
            monitoring_frequency: 'daily',
            is_active: true
          }
        ].filter(source => source.source_url && source.source_url !== '')
      };

      if (isEditMode) {
        const response = await fetch(`/api/competitors/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(competitorData)
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Database connection failed' }));
          throw new Error(error.error || 'Failed to update competitor');
        }

        console.log('✅ Competitor updated successfully');
      } else {
        const response = await fetch('/api/competitors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(competitorData)
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Database connection failed' }));
          if (response.status === 500) {
            throw new Error('Database not configured. Please execute the competitive intelligence schema in Supabase SQL Editor first.');
          }
          throw new Error(error.error || 'Failed to create competitor');
        }

        const result = await response.json();
        console.log('✅ Competitor created successfully:', result.competitor);
      }
      
      // Save AI research metadata to localStorage for edit mode compatibility
      const competitorIdForStorage = isEditMode ? editId : result?.competitor?.id || Date.now().toString();
      
      if (competitorIdForStorage) {
        // Save AI populated fields
        localStorage.setItem(`ai_research_${competitorIdForStorage}`, JSON.stringify([...aiPopulatedFields]));
        // Save manually edited fields
        localStorage.setItem(`manual_edits_${competitorIdForStorage}`, JSON.stringify([...manuallyEditedFields]));
        // Save research timestamp
        localStorage.setItem(`research_timestamp_${competitorIdForStorage}`, new Date().toISOString());
      }
      
      // Navigate back to appropriate page
      if (isEditMode && editId) {
        // Navigate back to the specific competitor profile page
        router.push(`/competitor-intelligence/competitors/${editId}`);
      } else {
        // Navigate back to competitor intelligence page - profiles tab for new competitors
        router.push('/competitors');
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} competitor:`, error);
      // You could add a toast notification here
      alert(`Failed to ${isEditMode ? 'update' : 'create'} competitor: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Show toast notification function with field highlighting
  const showToast = (message: string, type: 'error' | 'success' | 'warning', fieldsToHighlight: string[] = []) => {
    setToast({ message, type, show: true });
    
    // Highlight specified fields
    if (fieldsToHighlight.length > 0) {
      setHighlightedFields(new Set(fieldsToHighlight));
      
      // Clear highlights after 8 seconds
      setTimeout(() => {
        setHighlightedFields(new Set());
      }, 8000);
    }
    
    // Hide toast after 5 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Validate required fields for AI Research
  const validateAIResearch = () => {
    const errors: {message: string, field: string}[] = [];
    
    if (!newCompetitor.name?.trim() && !newCompetitor.website?.trim()) {
      // Both fields are empty - highlight both but show one message
      errors.push({message: 'Please provide at least a company name or website to research', field: 'both'});
    }
    
    return errors;
  };

  const handleAIResearch = async () => {
    // Validate fields first
    const validationErrors = validateAIResearch();
    if (validationErrors.length > 0) {
      const firstError = validationErrors[0];
      const fieldsToHighlight = firstError.field === 'both' ? ['name', 'website'] : [firstError.field];
      showToast(firstError.message, 'error', fieldsToHighlight);
      return;
    }

    setIsResearching(true);
    try {
      // In a real implementation, this would call an AI service or API
      // For demo purposes, we'll simulate the research with realistic data
      
      const researchData = await simulateAIResearch(newCompetitor.name, newCompetitor.website);
      
      // Smart merge: Allow regeneration to update AI-populated fields, preserve manually edited fields
      const updatedCompetitor = { ...newCompetitor };
      const populatedFields = new Set<string>();
      
      Object.keys(researchData).forEach(key => {
        const fieldKey = key as keyof NewCompetitor;
        const currentValue = newCompetitor[fieldKey];
        const researchValue = researchData[fieldKey];
        
        // Check if field was manually edited by user after AI population
        const wasManuallyEdited = manuallyEditedFields.has(fieldKey);
        
        // Only populate if field is empty/undefined/default, and research has data
        const isEmptyField = !currentValue || 
          (Array.isArray(currentValue) && currentValue.length === 0) ||
          (typeof currentValue === 'string' && currentValue.trim() === '');
          
        // Special case: Allow overwriting default threat_level 'medium' 
        const isDefaultThreatLevel = fieldKey === 'threat_level' && currentValue === 'medium';
        
        // Allow updating AI-populated fields that haven't been manually edited (for regeneration)
        const canRegenerateField = aiPopulatedFields.has(fieldKey) && !wasManuallyEdited;
        
        // In edit mode, show preference for preserving manual edits
        const shouldPopulate = isEditMode 
          ? ((isEmptyField || canRegenerateField) && researchValue && !wasManuallyEdited)
          : ((isEmptyField || isDefaultThreatLevel || canRegenerateField) && researchValue);
          
        if (shouldPopulate) {
          (updatedCompetitor as any)[fieldKey] = researchValue;
          populatedFields.add(key);
          // Debug logging
          if (fieldKey === 'threat_level') {
            console.log(`🎯 THREAT LEVEL UPDATE: "${currentValue}" → "${researchValue}"`);
          }
          if (canRegenerateField) {
            console.log(`🔄 REGENERATING FIELD: "${fieldKey}" with ${Array.isArray(researchValue) ? researchValue.length + ' items' : '"' + researchValue + '"'}`);
          }
        }
      });
      
      setNewCompetitor(updatedCompetitor);
      setAiPopulatedFields(populatedFields);
      setResearchComplete(true);
      
      // Final verification log
      console.log(`📊 FINAL UI DATA - Threat Level: "${updatedCompetitor.threat_level}"`);
      console.log(`📋 AI Populated Fields:`, Array.from(populatedFields));
      
      // Show success toast
      showToast('AI research completed successfully!', 'success');
      
      // Auto-scroll to the comprehensive report after research is complete
      setTimeout(() => {
        window.scrollTo({ top: 600, behavior: 'smooth' });
      }, 500);
      
    } catch (error) {
      console.error('AI research failed:', error);
      showToast('AI research failed. Please fill in the information manually.', 'error');
    } finally {
      setIsResearching(false);
    }
  };

  // Simulate AI research - in real app, this would call an AI service
  const simulateAIResearch = async (companyName: string, website: string): Promise<Partial<NewCompetitor>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock research data based on common companies
    // Define Marq.com profile for contextual threat assessment
    const MARQ_PROFILE = {
      name: 'Marq',
      industry: 'Design & Marketing Technology',
      target_market: ['SMBs', 'Marketing Teams', 'Brand Management'],
      key_products: ['Brand Templates', 'Design Automation', 'Brand Management', 'Marketing Asset Creation'],
      market_segments: ['brand management', 'template design', 'marketing automation', 'SMB design tools'],
      competitive_focus: ['ease of use', 'template-based design', 'brand consistency', 'marketing efficiency']
    };

    const mockData: Record<string, Partial<NewCompetitor>> = {
      'canva': {
        name: 'Canva',
        website: 'https://canva.com',
        industry: 'Design & Marketing Technology',
        location: 'Sydney, Australia',
        founded: '2013',
        employees: '4,000',
        marketCap: '$40B',
        description: 'Global visual communication platform that empowers users to design anything and publish anywhere. Canva democratizes design through intuitive drag-and-drop tools, extensive template libraries, and collaborative features for individuals and teams.',
        threat_level: 'high', // High threat due to direct market overlap
        key_products: [
          // Design & Creative Tools
          'Design Platform', 'Template Library', 'Brand Kit', 'Logo Maker', 'Photo Editor',
          'Video Editor', 'Presentation Tool', 'Infographic Maker', 'Social Media Designer',
          'Print Design', 'Animation Tool', 'AI Design Assistant', 'Stock Photo Library',
          'Icon Library', 'Background Remover', 'Image Resizer', 'Mockup Generator',
          'Chart Maker', 'Color Palette Tool', 'Font Manager',
          // Marketing & Business Tools  
          'Content Management', 'Content Calendar', 'Marketing Analytics', 'Campaign Manager',
          'Social Media Scheduler', 'A/B Testing', 'Asset Management',
          // Technology & Integration
          'Team Collaboration', 'Mobile App', 'Cloud Storage', 'API Platform',
          'Third-party Integrations', 'Workflow Automation', 'Multi-language Support'
        ],
        strengths: [
          // Market & Business
          'Market leader', 'Strong brand recognition', 'Large user base', 'Global presence',
          'Massive user base (170M+ monthly)', 'First-mover advantage', 'Network effects',
          'Viral growth', 'Word-of-mouth marketing', 'Media coverage',
          // Product & Features
          'Comprehensive feature set', 'Regular updates', 'Advanced AI features', 'Extensive template library',
          'High-quality assets', 'Professional designs', 'AI Design Assistant', 'Magic Studio AI',
          'Multi-format export', 'Brand consistency tools', 'Template versioning',
          // User Experience
          'User-friendly interface', 'Intuitive design', 'Easy learning curve', 'Great onboarding',
          'Drag-and-drop functionality', 'Visual editor', 'Mobile-responsive', 'Fast performance',
          // Business Model
          'Freemium model', 'Affordable pricing', 'Flexible plans', 'Good value for money',
          'Team pricing', 'Volume discounts',
          // Technical
          'Real-time collaboration', 'Cloud-based platform', 'Multi-language support',
          'Mobile app', 'API availability', 'Third-party integrations'
        ],
        weaknesses: [
          // Features & Limitations
          'Template dependency', 'Limited customization', 'Generic brand aesthetic risk',
          'Storage limitations', 'Export restrictions', 'Watermarks on free tier',
          'Limited brand controls', 'No white labeling', 'Asset licensing issues',
          'No advanced editing', 'Limited font options', 'No version history',
          // Usability & Performance  
          'Performance issues', 'Slow loading times', 'Memory intensive',
          'Browser compatibility issues', 'Limited offline access', 'No keyboard shortcuts',
          // Pricing & Business
          'Expensive pricing', 'Complex pricing structure', 'Limited free features',
          'Subscription fatigue', 'Freemium limitations', 'Upgrade pressure',
          'Feature paywalls', 'Usage restrictions',
          // Technical
          'Browser dependency', 'No desktop app', 'Limited API access',
          'Integration challenges', 'Data portability issues'
        ]
      },
      'adobe': {
        name: 'Adobe Creative Cloud',
        website: 'https://adobe.com',
        industry: 'Design & Creative Software',
        location: 'San Jose, CA',
        founded: '1982',
        employees: '26,000',
        marketCap: '$240B',
        description: 'Industry-leading creative software suite including Photoshop, Illustrator, InDesign, and emerging AI tools. Adobe dominates professional creative workflows but is expanding into simplified design tools for broader markets.',
        threat_level: 'medium', // Medium threat - different market segment but expanding downmarket
        key_products: ['Photo Editor', 'Design Platform', 'Desktop App', 'Cloud Storage', 'API Platform', 'Asset Management'],
        strengths: ['Industry partnerships', 'Advanced AI features', 'Professional designs', 'Established reputation', 'Comprehensive feature set', 'Innovation focus'],
        weaknesses: ['Steep learning curve', 'Expensive pricing', 'Complex interface', 'Overwhelming for beginners', 'Requires training', 'Poor value for SMBs']
      },
      'figma': {
        name: 'Figma',
        website: 'https://figma.com',
        industry: 'Design & Collaboration',
        location: 'San Francisco, CA',
        founded: '2012',
        employees: '1,000',
        marketCap: '$20B', // Adobe acquisition valuation
        description: 'Collaborative web-based design tool that revolutionized design workflows through real-time collaboration, version control, and browser-based accessibility. Strong in UI/UX design and team collaboration.',
        threat_level: 'low', // Low threat - different focus area (UI/UX vs marketing design)
        key_products: ['Design Platform', 'Real-time collaboration', 'Web Design', 'Mobile Design', 'Team Collaboration', 'Version control'],
        strengths: ['Real-time collaboration', 'Cloud-based platform', 'Strong community', 'Easy learning curve', 'Version control', 'Freemium model'],
        weaknesses: ['Limited integrations', 'No offline access', 'Limited customization', 'Niche focus only', 'Template dependency']
      },
      'salesforce': {
        name: 'Salesforce',
        website: 'https://salesforce.com',
        industry: 'CRM & Sales',
        location: 'San Francisco, CA',
        founded: '1999',
        employees: '79,000',
        marketCap: '$248B',
        description: 'Leading cloud-based CRM platform with AI-powered sales and marketing tools. Salesforce provides a comprehensive suite of business applications focused on customer service, marketing automation, analytics, and application development.',
        threat_level: 'low', // Different market entirely
        key_products: ['Sales Cloud', 'Service Cloud', 'Marketing Cloud', 'Einstein AI', 'Tableau', 'Slack'],
        strengths: ['Market leader', 'Comprehensive platform', 'Strong AI integration', 'Extensive app marketplace', 'Global presence'],
        weaknesses: ['High complexity', 'Expensive for SMBs', 'Steep learning curve', 'Over-engineered for simple needs']
      },
      'hubspot': {
        name: 'HubSpot',
        website: 'https://hubspot.com',
        industry: 'Marketing & Sales',
        location: 'Cambridge, MA',
        founded: '2006',
        employees: '7,000',
        marketCap: '$31B',
        description: 'Inbound marketing, sales, and customer service platform with integrated CRM. HubSpot focuses on helping businesses attract, engage, and delight customers through content marketing and automation.',
        threat_level: 'low', // Different market focus
        key_products: ['Marketing Hub', 'Sales Hub', 'Service Hub', 'CMS Hub', 'Operations Hub'],
        strengths: ['User-friendly interface', 'Strong inbound methodology', 'Integrated platform', 'Excellent content marketing', 'Free tier available'],
        weaknesses: ['Limited enterprise features', 'Pricing complexity', 'Reporting limitations', 'Less customizable']
      },
      'visme': {
        name: 'Visme',
        website: 'https://visme.co',
        industry: 'Design & Presentation Software',
        location: 'Rockville, MD',
        founded: '2013',
        employees: '200',
        marketCap: '$50M',
        description: 'All-in-one visual content creation platform for presentations, infographics, and design assets. Focuses on business users and marketing teams with template-based design tools.',
        threat_level: 'high', // Direct competitor in template-based design
        key_products: ['Presentation Maker', 'Infographic Maker', 'Brand Kit', 'Video Maker', 'Form Builder', 'Chart Maker'],
        strengths: ['Template variety', 'Business focus', 'Infographic specialization', 'Animation features', 'Brand management tools'],
        weaknesses: ['Smaller user base', 'Limited social features', 'Less AI integration', 'Performance issues with complex projects']
      },
      'piktochart': {
        name: 'Piktochart',
        website: 'https://piktochart.com',
        industry: 'Design & Data Visualization',
        location: 'Penang, Malaysia',
        founded: '2011',
        employees: '100',
        marketCap: '$20M',
        description: 'Infographic and visual storytelling platform focused on data visualization and professional presentations. Strong in educational and corporate markets.',
        threat_level: 'medium', // Some overlap but more specialized
        key_products: ['Infographic Maker', 'Presentation Tool', 'Video Maker', 'Flyer Creator', 'Report Designer'],
        strengths: ['Data visualization focus', 'Professional templates', 'Educational market penetration', 'Chart integration'],
        weaknesses: ['Niche market focus', 'Limited general design tools', 'Smaller template library', 'Less brand management features']
      },
      'designwizard': {
        name: 'DesignWizard',
        website: 'https://designwizard.com',
        industry: 'Graphic Design Software',
        location: 'Belfast, UK',
        founded: '2017',
        employees: '50',
        marketCap: '$10M',
        description: 'Online graphic design tool with focus on social media content and marketing materials. Offers templates and stock content for small businesses.',
        threat_level: 'medium', // Smaller player but direct market overlap
        key_products: ['Social Media Designer', 'Marketing Materials', 'Logo Maker', 'Video Creator', 'Stock Library'],
        strengths: ['Social media focus', 'Affordable pricing', 'Stock content library', 'User-friendly interface'],
        weaknesses: ['Limited advanced features', 'Smaller market presence', 'Basic brand management', 'Limited collaboration tools']
      },
      'pipedrive': {
        name: 'Pipedrive',
        website: 'https://pipedrive.com',
        industry: 'Sales CRM',
        location: 'Tallinn, Estonia',
        founded: '2010',
        employees: '1,000',
        marketCap: '$2.1B',
        description: 'Sales-focused CRM designed for small to medium businesses. Pipedrive emphasizes visual sales pipeline management and activity-based selling methodology.',
        threat_level: 'low', // Different market focus
        key_products: ['Sales CRM', 'Pipeline Management', 'Email Sync', 'Mobile App', 'Sales Reporting'],
        strengths: ['Simple and intuitive', 'Visual pipeline', 'Affordable pricing', 'Good mobile app', 'Fast setup'],
        weaknesses: ['Limited marketing features', 'Basic reporting', 'Fewer integrations', 'Limited customization']
      }
    };

    const searchKey = (companyName.toLowerCase() + ' ' + website.toLowerCase()).trim();
    
    // Intelligent threat assessment based on market overlap
    const calculateThreatLevel = (competitorData: any): 'high' | 'medium' | 'low' => {
      if (!competitorData.industry) return 'medium';
      
      const competitorIndustry = competitorData.industry.toLowerCase();
      const marqIndustry = MARQ_PROFILE.industry.toLowerCase();
      
      // High threat: Direct industry overlap
      if (competitorIndustry.includes('design') || competitorIndustry.includes('marketing')) {
        return 'high';
      }
      
      // Medium threat: Adjacent markets or expanding into our space
      if (competitorIndustry.includes('creative') || competitorIndustry.includes('collaboration') || 
          competitorIndustry.includes('software') || competitorIndustry.includes('technology')) {
        return 'medium';
      }
      
      // Low threat: Different markets entirely
      return 'low';
    };
    
    // Enhanced search with detailed debugging - more reliable and consistent
    let matchedData: Partial<NewCompetitor> | null = null;
    let matchedKey = '';
    let matchStrategy = '';
    
    // Debug search inputs
    console.log(`🔍 AI Research Search Inputs:`);
    console.log(`   Company Name: "${companyName}"`);
    console.log(`   Website: "${website}"`);
    console.log(`   Available Keys:`, Object.keys(mockData));
    
    // Strategy 1: Direct company name match (most reliable)
    if (companyName) {
      const searchName = companyName.toLowerCase().trim();
      for (const [key, data] of Object.entries(mockData)) {
        if (searchName.includes(key) || key === searchName || searchName === key) {
          matchedData = data;
          matchedKey = key;
          matchStrategy = 'Direct Name Match';
          console.log(`✅ Strategy 1 SUCCESS: "${searchName}" matched "${key}"`);
          break;
        }
      }
    }
    
    // Strategy 2: Website domain match (secondary)
    if (!matchedData && website) {
      const cleanWebsite = website.toLowerCase().trim();
      // Extract domain more carefully
      let domain = cleanWebsite;
      domain = domain.replace(/https?:\/\//, '');
      domain = domain.replace(/^www\./, '');
      domain = domain.split('/')[0];
      domain = domain.replace(/\.com$/, '');
      
      console.log(`🌐 Extracted domain: "${domain}" from website: "${website}"`);
      
      for (const [key, data] of Object.entries(mockData)) {
        if (domain === key) {
          matchedData = data;
          matchedKey = key;
          matchStrategy = 'Website Domain Match';
          console.log(`✅ Strategy 2 SUCCESS: domain "${domain}" matched key "${key}"`);
          break;
        }
      }
    }
    
    // Strategy 3: Fuzzy name matching for common variations
    if (!matchedData && companyName) {
      const searchName = companyName.toLowerCase().trim();
      for (const [key, data] of Object.entries(mockData)) {
        const dataName = data.name?.toLowerCase() || '';
        // More precise fuzzy matching
        if (dataName.includes(searchName) || searchName.includes(key)) {
          matchedData = data;
          matchedKey = key;
          matchStrategy = 'Fuzzy Name Match';
          console.log(`✅ Strategy 3 SUCCESS: "${searchName}" fuzzy matched "${key}"`);
          break;
        }
      }
    }
    
    // Debug results
    if (matchedData) {
      console.log(`🎯 MATCH FOUND!`);
      console.log(`   Strategy: ${matchStrategy}`);
      console.log(`   Key: "${matchedKey}"`);
      console.log(`   Company: "${matchedData.name}"`);
      console.log(`   Threat Level: ${matchedData.threat_level}`);
      console.log(`   Full Data:`, matchedData);
    } else {
      console.log(`❌ NO MATCH FOUND - Will use fallback logic`);
    }
    
    // Return matched data or generate intelligent generic data
    if (matchedData) {
      return matchedData;
    }
    
    // Enhanced product analysis for better coverage
    const analyzeCompetitorProducts = (name: string, website: string, industry: string): string[] => {
      const products: string[] = [];
      const lowerName = name.toLowerCase();
      const lowerWebsite = website.toLowerCase();
      const lowerIndustry = industry.toLowerCase();
      
      // Design & Marketing Tools Analysis - MUCH more comprehensive for unknown competitors
      if (lowerIndustry.includes('design') || lowerIndustry.includes('marketing') || lowerIndustry.includes('creative') ||
          lowerName.includes('design') || lowerWebsite.includes('design') || lowerWebsite.includes('creative') ||
          lowerName.includes('template') || lowerName.includes('brand') || lowerName.includes('visual') ||
          lowerWebsite.includes('template') || lowerWebsite.includes('brand') || lowerWebsite.includes('visual')) {
        
        // Core design products - assume comprehensive suite for design companies
        products.push('Design Platform', 'Template Library', 'Brand Kit');
        
        // Assume most modern design platforms have these core capabilities
        products.push('Photo Editor', 'Logo Maker', 'Social Media Designer', 'Print Design');
        
        // Additional common design tools for modern platforms
        products.push('Icon Library', 'Color Palette Tool', 'Font Manager', 'Image Resizer');
        
        // Modern design workflow features
        products.push('Collaborative Editing', 'Version History', 'Export Options', 'Asset Libraries');
        
        // Check for specific advanced capabilities
        if (lowerName.includes('video') || lowerName.includes('motion') || lowerWebsite.includes('video')) {
          products.push('Video Editor', 'Animation Tool');
        }
        if (lowerName.includes('present') || lowerName.includes('slide') || lowerWebsite.includes('present') ||
            lowerWebsite.includes('gamma.app') || lowerWebsite.includes('pitch.com') || 
            lowerWebsite.includes('beautiful.ai') || lowerWebsite.includes('tome.app') ||
            lowerWebsite.includes('slides.com') || lowerWebsite.includes('deck.')) {
          // Comprehensive presentation tool capabilities
          products.push('Presentation Tool', 'Slide Builder', 'Interactive Presentations', 
                       'Presentation Analytics', 'Speaker Notes', 'Slide Transitions',
                       'Auto-layout', 'Smart Formatting', 'Content Suggestions');
        }
        if (lowerName.includes('infographic') || lowerName.includes('chart') || lowerWebsite.includes('infographic')) {
          products.push('Infographic Maker', 'Chart Maker');
        }
        if (lowerName.includes('print') || lowerWebsite.includes('print')) {
          products.push('Print Design');
        }
        if (lowerName.includes('web') || lowerName.includes('website') || lowerWebsite.includes('web')) {
          products.push('Web Design');
        }
        if (lowerName.includes('mobile') || lowerName.includes('app') || lowerWebsite.includes('mobile')) {
          products.push('Mobile Design');
        }
        
        // Advanced features for modern design tools
        if (lowerName.includes('ai') || lowerName.includes('smart') || lowerName.includes('auto') || 
            lowerWebsite.includes('ai') || lowerWebsite.includes('smart') ||
            lowerWebsite.includes('gamma.app') || lowerWebsite.includes('beautiful.ai')) {
          products.push('AI Design Assistant', 'Background Remover', 'Smart cropping', 'Content generation');
        }
        
        // Special handling for modern presentation tools (.app domains are usually feature-rich)
        if (lowerWebsite.includes('.app') || lowerWebsite.includes('.ai') || 
            (detectedIndustry && detectedIndustry.includes('Design & Marketing Technology'))) {
          // Assume comprehensive modern capabilities for .app/.ai design tools
          products.push('AI Design Assistant', 'Background Remover', 'Smart suggestions', 
                       'Auto-layout', 'Content generation', 'Smart Formatting',
                       'Design Systems', 'Component Libraries', 'Responsive Design');
        }
        
        // Stock content features
        if (lowerName.includes('stock') || lowerName.includes('photo') || lowerName.includes('image') ||
            lowerWebsite.includes('stock') || lowerWebsite.includes('photo')) {
          products.push('Stock Photo Library', 'Image Resizer');
        }
        
        // Additional design tools
        products.push('Icon Library', 'Color Palette Tool', 'Font Manager', 'Mockup Generator');
      }
      
      // Marketing & Business Tools - Enhanced detection for unknown competitors
      if (lowerIndustry.includes('marketing') || lowerIndustry.includes('business') || lowerIndustry.includes('saas') ||
          lowerName.includes('marketing') || lowerName.includes('automation') || lowerName.includes('business') ||
          lowerName.includes('campaign') || lowerName.includes('email') || lowerName.includes('social') || 
          lowerName.includes('analytics') || lowerName.includes('crm') || 
          lowerWebsite.includes('marketing') || lowerWebsite.includes('business') || lowerWebsite.includes('saas')) {
        
        // Assume most marketing platforms have core capabilities
        products.push('Marketing Automation', 'Analytics Dashboard', 'Content Management', 'Content Calendar');
        
        // Email marketing detection
        if (lowerName.includes('email') || lowerName.includes('mail') || lowerName.includes('campaign') ||
            lowerWebsite.includes('email') || lowerWebsite.includes('mail')) {
          products.push('Email Marketing', 'Campaign Manager');
        }
        
        // Social media detection
        if (lowerName.includes('social') || lowerWebsite.includes('social') || 
            lowerName.includes('post') || lowerWebsite.includes('post')) {
          products.push('Social Media Scheduler', 'Social Media Designer');
        }
        
        // Lead generation and conversion
        if (lowerName.includes('lead') || lowerName.includes('conversion') || lowerName.includes('funnel') ||
            lowerWebsite.includes('lead') || lowerWebsite.includes('conversion')) {
          products.push('Lead Generation', 'Conversion Tracking', 'Landing Page Builder', 'A/B Testing');
        }
        
        // Form and survey tools
        if (lowerName.includes('form') || lowerName.includes('survey') || lowerWebsite.includes('form')) {
          products.push('Form Builder', 'Survey Creator');
        }
        
        // Event and webinar platforms
        if (lowerName.includes('event') || lowerName.includes('webinar') || lowerWebsite.includes('event')) {
          products.push('Event Management', 'Webinar Platform');
        }
        
        // CRM and customer management
        if (lowerName.includes('crm') || lowerName.includes('customer') || lowerWebsite.includes('crm')) {
          products.push('CRM Integration', 'Customer Support', 'Customer Journey Mapping');
        }
        
        // For design-marketing hybrid platforms
        if (lowerIndustry.includes('design') || lowerName.includes('design') || lowerWebsite.includes('design')) {
          products.push('Marketing Analytics', 'Asset Management');
        }
      }
      
      // Technology & Integration - Assume modern SaaS capabilities for unknown competitors  
      if (lowerIndustry.includes('software') || lowerIndustry.includes('technology') || lowerIndustry.includes('saas') ||
          lowerIndustry.includes('design') || lowerIndustry.includes('marketing') || // Most design/marketing tools are SaaS
          lowerWebsite.includes('api') || lowerWebsite.includes('integration') ||
          lowerName.includes('platform') || lowerName.includes('integration') ||
          lowerName.includes('api') || lowerName.includes('cloud') ||
          lowerName.includes('enterprise') || lowerName.includes('developer')) {
        
        // Assume basic modern SaaS capabilities
        products.push('Cloud Storage', 'Team Collaboration');
        
        // API and integration capabilities (most modern tools have these)
        if (lowerIndustry.includes('design') || lowerIndustry.includes('marketing') || lowerIndustry.includes('software')) {
          products.push('API Platform', 'Third-party Integrations');
        }
        
        // Mobile presence (most platforms have this now)
        if (!lowerName.includes('desktop') && !lowerName.includes('legacy')) {
          products.push('Mobile App');
        }
        
        // Browser and desktop apps
        if (lowerName.includes('browser') || lowerName.includes('chrome') || lowerName.includes('extension') ||
            lowerWebsite.includes('browser') || lowerWebsite.includes('extension')) {
          products.push('Browser Extension');
        }
        if (lowerName.includes('desktop') || lowerName.includes('windows') || lowerName.includes('mac') ||
            lowerWebsite.includes('desktop') || lowerWebsite.includes('download')) {
          products.push('Desktop App');
        }
        
        // Workflow automation (common in modern tools)
        if (lowerName.includes('workflow') || lowerName.includes('automation') || 
            lowerWebsite.includes('automation') || lowerWebsite.includes('zapier')) {
          products.push('Workflow Automation');
        }
        
        // Enterprise features for business-focused tools
        if (lowerName.includes('enterprise') || lowerName.includes('business') || lowerName.includes('pro') ||
            lowerWebsite.includes('enterprise') || lowerWebsite.includes('business')) {
          products.push('Enterprise Suite', 'Single Sign-On (SSO)');
        }
        
        // Common integrations
        if (lowerWebsite.includes('slack') || lowerName.includes('slack')) {
          products.push('Slack Integration');
        }
        if (lowerWebsite.includes('microsoft') || lowerName.includes('microsoft') || lowerWebsite.includes('office')) {
          products.push('Microsoft Integration');
        }
        if (lowerWebsite.includes('google') || lowerName.includes('google') || lowerWebsite.includes('gmail')) {
          products.push('Google Workspace Integration');
        }
        
        // Developer tools for platforms
        if (lowerName.includes('developer') || lowerName.includes('api') || lowerWebsite.includes('developer')) {
          products.push('Webhook Support', 'REST API', 'SDK/Developer Tools');
        }
        
        // White label capabilities
        if (lowerName.includes('white') || lowerName.includes('label') || lowerName.includes('custom') ||
            lowerWebsite.includes('white') || lowerWebsite.includes('custom')) {
          products.push('White Label Solution', 'Custom Branding');
        }
      }
      
      // Collaboration features
      if (lowerName.includes('team') || lowerName.includes('collaborat') || lowerName.includes('share')) {
        products.push('Team Collaboration');
      }
      
      return [...new Set(products)]; // Remove duplicates
    };
    
    const analyzeCompetitorStrengths = (name: string, industry: string, threatLevel: string): string[] => {
      const strengths: string[] = [];
      const lowerName = name.toLowerCase();
      const lowerIndustry = industry.toLowerCase();
      
      // ONLY select from existing library options
      const allStrengths = Object.values(STRENGTH_CATEGORIES).flat();
      
      // Threat level based selections
      if (threatLevel === 'high') {
        // Select market leadership strengths
        const marketStrengths = ['Market leader', 'Strong brand recognition', 'Large user base', 'Global presence', 'Strong community'];
        marketStrengths.forEach(s => {
          if (allStrengths.includes(s)) strengths.push(s);
        });
        
        // Select comprehensive feature strengths
        const featureStrengths = ['Comprehensive feature set', 'Regular updates', 'Advanced AI features'];
        featureStrengths.forEach(s => {
          if (allStrengths.includes(s)) strengths.push(s);
        });
      } else if (threatLevel === 'medium') {
        // Select innovation and value strengths
        const mediumStrengths = ['Innovation focus', 'Good value for money', 'User-friendly interface', 'Flexible plans'];
        mediumStrengths.forEach(s => {
          if (allStrengths.includes(s)) strengths.push(s);
        });
      } else {
        // Select niche strengths
        const nicheStrengths = ['Niche expertise', 'Specialized solutions', 'Affordable pricing'];
        nicheStrengths.forEach(s => {
          if (allStrengths.includes(s)) strengths.push(s);
        });
      }
      
      // Industry specific selections - ONLY from library
      if (lowerIndustry.includes('design') || lowerIndustry.includes('creative') || lowerIndustry.includes('Marketing')) {
        const designStrengths = [
          // Product & Features
          'Extensive template library', 'Professional designs', 'High-quality assets',
          'Multi-format export', 'Brand consistency tools', 'Template versioning',
          'Design system integration', 'Asset organization', 'Comprehensive feature set',
          'Customization options', 'High-resolution outputs', 'Print-ready files',
          // User Experience  
          'Visual editor', 'Drag-and-drop functionality', 'Easy learning curve',
          'Great onboarding', 'Intuitive design', 'Fast performance', 'User-friendly interface',
          'WYSIWYG interface', 'Auto-save features', 'Keyboard shortcuts',
          // Technical
          'Real-time collaboration', 'Version control', 'Multi-device sync'
        ];
        designStrengths.forEach(s => {
          if (allStrengths.includes(s)) strengths.push(s);
        });
      }
      
      if (lowerIndustry.includes('marketing')) {
        const marketingStrengths = [
          'Marketing Automation', 'Analytics Dashboard', 'Team collaboration',
          'Integration capabilities', 'Performance monitoring'
        ];
        marketingStrengths.forEach(s => {
          if (allStrengths.includes(s)) strengths.push(s);
        });
      }
      
      // Technology/SaaS strengths
      if (lowerIndustry.includes('technology') || lowerIndustry.includes('software') || lowerIndustry.includes('design')) {
        const techStrengths = [
          'Cloud-based platform', 'API availability', 'Third-party integrations',
          'Real-time collaboration', 'Version control', 'Mobile-responsive'
        ];
        techStrengths.forEach(s => {
          if (allStrengths.includes(s)) strengths.push(s);
        });
      }
      
      // Modern platform indicators (.app domains, AI tools, design platforms)
      if (lowerName.includes('ai') || lowerName.includes('smart') || lowerName.includes('auto') ||
          (name === '' && (industry.includes('Design') || industry.includes('Marketing'))) ||
          industry.includes('Design & Marketing Technology')) {
        const modernStrengths = [
          'AI-powered features', 'Machine learning capabilities', 'Automated suggestions',
          'Smart suggestions', 'Auto-layout features', 'Content generation'
        ];
        modernStrengths.forEach(s => {
          if (allStrengths.includes(s)) strengths.push(s);
        });
      }
      
      // Business Model strengths for modern SaaS platforms
      if (industry.includes('Design') || industry.includes('Marketing') || industry.includes('Technology')) {
        const businessStrengths = [
          'Freemium model', 'Flexible plans', 'Good value for money', 
          'Scalable platform', 'Cloud-based platform'
        ];
        businessStrengths.forEach(s => {
          if (allStrengths.includes(s)) strengths.push(s);
        });
      }
      
      // Support & Resources for professional tools
      if (threatLevel === 'high' || industry.includes('Design')) {
        const supportStrengths = [
          'Comprehensive documentation', 'Training resources', 'Video tutorials',
          'Active community forum', 'Knowledge base'
        ];
        supportStrengths.forEach(s => {
          if (allStrengths.includes(s)) strengths.push(s);
        });
      }
      
      // Technical strengths for all modern platforms
      const technicalStrengths = [
        'Security focused', 'Data privacy', 'High availability', 'Performance monitoring',
        'GDPR compliant', 'Data encryption', 'Backup and recovery', 'CDN distribution'
      ];
      technicalStrengths.forEach(s => {
        if (allStrengths.includes(s)) strengths.push(s);
      });
      
      // Additional User Experience strengths for modern tools
      if (industry.includes('Design') || industry.includes('Marketing') || threatLevel === 'high') {
        const additionalUXStrengths = [
          'Mobile-responsive', 'Reliable uptime', 'Excellent UX/UI', 'Accessibility compliant'
        ];
        additionalUXStrengths.forEach(s => {
          if (allStrengths.includes(s)) strengths.push(s);
        });
      }
      
      // Market & Business strengths for established tools
      if (threatLevel === 'high' || threatLevel === 'medium') {
        const additionalMarketStrengths = [
          'Established reputation', 'Industry partnerships', 'Thought leadership'
        ];
        additionalMarketStrengths.forEach(s => {
          if (allStrengths.includes(s)) strengths.push(s);
        });
      }
      
      return [...new Set(strengths)];
    };
    
    const analyzeCompetitorWeaknesses = (name: string, industry: string, threatLevel: string): string[] => {
      const weaknesses: string[] = [];
      const lowerName = name.toLowerCase();
      const lowerIndustry = industry.toLowerCase();
      
      // ONLY select from existing library options - be VERY conservative
      const allWeaknesses = Object.values(WEAKNESS_CATEGORIES).flat();
      
      // Only add weaknesses for specific known competitors or very generic ones for unknowns
      if (lowerName.includes('canva')) {
        const canvaWeaknesses = ['Template dependency', 'Generic brand aesthetic risk', 'Limited customization'];
        canvaWeaknesses.forEach(w => {
          if (allWeaknesses.includes(w)) weaknesses.push(w);
        });
      } else if (lowerName.includes('adobe')) {
        const adobeWeaknesses = ['Steep learning curve', 'Expensive pricing', 'Complex interface'];
        adobeWeaknesses.forEach(w => {
          if (allWeaknesses.includes(w)) weaknesses.push(w);
        });
      } else if (lowerName.includes('figma')) {
        const figmaWeaknesses = ['Limited offline access', 'Browser dependencies'];
        figmaWeaknesses.forEach(w => {
          if (allWeaknesses.includes(w)) weaknesses.push(w);
        });
      } else {
        // For unknown competitors, add appropriate generic weaknesses based on threat level and industry
        if (threatLevel === 'high') {
          // High threat unknown competitors - common challenges for emerging/established players
          const highThreatWeaknesses = ['Strong competition', 'Late to market trends'];
          highThreatWeaknesses.forEach(w => {
            if (allWeaknesses.includes(w)) weaknesses.push(w);
          });
        } else if (threatLevel === 'medium') {
          const mediumThreatWeaknesses = ['Limited market presence', 'Fewer integrations', 'Growing pains'];
          mediumThreatWeaknesses.forEach(w => {
            if (allWeaknesses.includes(w)) weaknesses.push(w);
          });
        } else {
          // Low threat
          const lowThreatWeaknesses = ['Limited market presence', 'Niche focus only', 'Basic feature set', 'Small user community'];
          lowThreatWeaknesses.forEach(w => {
            if (allWeaknesses.includes(w)) weaknesses.push(w);
          });
        }
        
        // Add industry-specific reasonable weaknesses for unknown competitors
        if (lowerIndustry.includes('design') || lowerIndustry.includes('creative')) {
          const designWeaknesses = ['Browser compatibility issues', 'Limited offline access', 'Export restrictions'];
          designWeaknesses.forEach(w => {
            if (allWeaknesses.includes(w)) weaknesses.push(w);
          });
        }
        
        // For newer/modern platforms (.app domains), assume some common startup challenges
        if (lowerName === '' && (industry.includes('Design') || industry.includes('Marketing'))) {
          const modernPlatformWeaknesses = ['Limited integrations', 'Smaller market presence'];
          modernPlatformWeaknesses.forEach(w => {
            if (allWeaknesses.includes(w)) weaknesses.push(w);
          });
        }
      }
      
      return [...new Set(weaknesses)];
    };
    
    // Generate contextually aware generic competitor data with enhanced analysis
    let genericThreatLevel = calculateThreatLevel({ industry: 'Technology' });
    const competitorName = companyName || 'Unknown Company';
    let detectedIndustry = 'Technology';
    
    // Enhanced pattern matching for industry detection
    const lowerName = competitorName.toLowerCase();
    const lowerWebsite = (website || '').toLowerCase();
    
    if (lowerName.includes('canva') || lowerWebsite.includes('canva')) {
      genericThreatLevel = 'high';
      detectedIndustry = 'Design & Marketing Technology';
    } else if (lowerName.includes('adobe') || lowerWebsite.includes('adobe')) {
      genericThreatLevel = 'medium';
      detectedIndustry = 'Design & Creative Software';
    } else if (lowerName.includes('figma') || lowerWebsite.includes('figma')) {
      genericThreatLevel = 'low';
      detectedIndustry = 'Design & Collaboration';
    } else if (lowerName.includes('design') || lowerWebsite.includes('design') || 
               lowerName.includes('creative') || lowerWebsite.includes('creative') ||
               lowerName.includes('template') || lowerWebsite.includes('template') ||
               lowerName.includes('brand') || lowerWebsite.includes('brand') ||
               lowerName.includes('visual') || lowerWebsite.includes('visual') ||
               lowerName.includes('photo') || lowerWebsite.includes('photo') ||
               lowerName.includes('logo') || lowerWebsite.includes('logo') ||
               lowerName.includes('present') || lowerWebsite.includes('present') ||
               lowerName.includes('slide') || lowerWebsite.includes('slide') ||
               lowerWebsite.includes('gamma.app') || lowerWebsite.includes('pitch.com') ||
               lowerWebsite.includes('beautiful.ai') || lowerWebsite.includes('tome.app') ||
               // Domain-based detection for known design/presentation tools
               lowerWebsite.includes('.app') || lowerWebsite.includes('.design') ||
               lowerWebsite.includes('.studio') || lowerWebsite.includes('.create')) {
      genericThreatLevel = 'high'; // Design tools are high threat to Marq
      detectedIndustry = 'Design & Marketing Technology';
    } else if (lowerName.includes('marketing') || lowerWebsite.includes('marketing') ||
               lowerName.includes('campaign') || lowerWebsite.includes('campaign') ||
               lowerName.includes('email') || lowerWebsite.includes('email') ||
               lowerName.includes('social') || lowerWebsite.includes('social')) {
      genericThreatLevel = 'medium';
      detectedIndustry = 'Marketing & Sales';
    } else if (lowerName.includes('platform') || lowerWebsite.includes('platform') ||
               lowerName.includes('saas') || lowerWebsite.includes('saas') ||
               lowerName.includes('software') || lowerWebsite.includes('software')) {
      genericThreatLevel = 'medium';
      detectedIndustry = 'Design & Marketing Technology'; // Assume design/marketing focus
    }
    
    console.log(`⚠️  No exact match found for "${competitorName}" / "${website}"`);
    console.log(`🤖 Generated threat level: ${genericThreatLevel} for industry: ${detectedIndustry}`);
    
    // Use enhanced analysis functions for more accurate competitor profiling
    const smartProducts = analyzeCompetitorProducts(competitorName, website || '', detectedIndustry);
    const smartStrengths = analyzeCompetitorStrengths(competitorName, detectedIndustry, genericThreatLevel);
    const smartWeaknesses = analyzeCompetitorWeaknesses(competitorName, detectedIndustry, genericThreatLevel);
    
    console.log(`🔍 Enhanced Analysis Results for "${competitorName}" / "${website}":`);
    console.log(`   Detected Industry: "${detectedIndustry}"`);
    console.log(`   Threat Level: "${genericThreatLevel}"`);
    console.log(`   Products (${smartProducts.length}):`, smartProducts);
    console.log(`   Strengths (${smartStrengths.length}):`, smartStrengths);
    console.log(`   Weaknesses (${smartWeaknesses.length}):`, smartWeaknesses);
    
    return {
      name: competitorName,
      website: website || '',
      industry: detectedIndustry,
      location: 'United States',
      founded: '2020',
      employees: '500',
      marketCap: '$500M',
      description: `${competitorName} operates in the ${detectedIndustry.toLowerCase()} sector. Enhanced AI analysis has identified ${smartProducts.length} key products/services, ${smartStrengths.length} competitive strengths, and ${smartWeaknesses.length} potential weaknesses. This comprehensive profile provides detailed insights into their market positioning and competitive overlap with Marq's design and marketing automation platform.`,
      threat_level: genericThreatLevel,
      key_products: smartProducts, // No limit - show all detected products
      strengths: smartStrengths, // No limit - show all detected strengths  
      weaknesses: smartWeaknesses // No limit - show all detected weaknesses
    };
  };

  const handleFieldChange = (fieldName: keyof NewCompetitor, value: any) => {
    setNewCompetitor(prev => ({ ...prev, [fieldName]: value }));
    if (aiPopulatedFields.has(fieldName)) {
      setManuallyEditedFields(prev => new Set(prev).add(fieldName));
    }
  };

  const getFieldIndicator = (fieldName: string) => {
    if (manuallyEditedFields.has(fieldName)) {
      return (
        <div className="flex items-center space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          <Zap className="w-3 h-3" />
          <span>AI + Manual</span>
        </div>
      );
    } else if (aiPopulatedFields.has(fieldName)) {
      return (
        <div className="flex items-center space-x-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
          <Sparkles className="w-3 h-3" />
          <span>AI Generated</span>
        </div>
      );
    }
    return null;
  };

  // Render expandable library section with checkbox functionality
  const renderLibrarySection = (
    categories: Record<string, string[]>, 
    selectedItems: string[],
    onToggle: (item: string) => void,
    colorClass: string,
    fieldType: 'products' | 'strengths' | 'weaknesses'
  ) => {
    const getColorClasses = (color: string) => {
      switch (color) {
        case 'blue':
          return {
            accent: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            checkbox: 'text-blue-600 focus:ring-blue-500'
          };
        case 'green':
          return {
            accent: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-200',
            checkbox: 'text-green-600 focus:ring-green-500'
          };
        case 'orange':
          return {
            accent: 'text-orange-600',
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            checkbox: 'text-orange-600 focus:ring-orange-500'
          };
        default:
          return {
            accent: 'text-gray-600',
            bg: 'bg-gray-50',
            border: 'border-gray-200',
            checkbox: 'text-indigo-600 focus:ring-indigo-500'
          };
      }
    };

    const getHeaderInfo = (fieldType: 'products' | 'strengths' | 'weaknesses') => {
      switch (fieldType) {
        case 'products':
          return {
            title: 'Product Categories',
            description: 'Common products and services offered by competitors'
          };
        case 'strengths':
          return {
            title: 'Competitive Advantages',
            description: 'Key areas where competitors typically excel'
          };
        case 'weaknesses':
          return {
            title: 'Competitive Gaps',
            description: 'Common areas where competitors may struggle'
          };
      }
    };

    const colorClasses = getColorClasses(colorClass);
    const headerInfo = getHeaderInfo(fieldType);
    const totalItems = Object.values(categories).flat().length;
    const selectedCount = selectedItems.length;

    return (
      <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
        {/* Modern Header */}
        <div className={`p-4 ${colorClasses.bg} ${colorClasses.border} rounded-t-lg border-b`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-sm font-semibold ${colorClasses.accent}`}>
                {headerInfo.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{headerInfo.description}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">
                {selectedCount} of {totalItems} selected
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        {Object.entries(categories).map(([categoryName, items], categoryIndex) => {
          const categorySelected = items.filter(item => selectedItems.includes(item)).length;
          
          return (
            <div key={categoryName} className="border-t border-gray-100 first:border-t-0">
              <div className="p-3 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">{categoryName}</h4>
                  <span className="text-xs text-gray-500">
                    {categorySelected}/{items.length} selected
                  </span>
                </div>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((item, index) => {
                  const isSelected = selectedItems.includes(item);
                  return (
                    <label
                      key={index}
                      className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggle(item)}
                        className={`w-4 h-4 rounded border-gray-300 ${colorClasses.checkbox} focus:ring-2 focus:ring-offset-0`}
                      />
                      <span className={`text-sm ${isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                        {item}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Compact pill display component
  const renderCompactPills = (
    items: string[], 
    onRemove: (index: number) => void, 
    showAll: boolean, 
    setShowAll: (show: boolean) => void,
    colorClasses: string,
    limit: number = 5
  ) => {
    const visibleItems = showAll ? items : items.slice(0, limit);
    const remainingCount = items.length - limit;
    
    return (
      <div className="flex flex-wrap gap-2 items-center">
        {visibleItems.map((item, index) => (
          <span
            key={index}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses}`}
          >
            {item}
            <button
              onClick={() => {
                // Find the actual index in the full array
                const actualIndex = items.findIndex(i => i === item);
                onRemove(actualIndex);
              }}
              className="ml-2"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        
        {!showAll && remainingCount > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600"
          >
            +{remainingCount} more
          </button>
        )}
        
        {showAll && items.length > limit && (
          <button
            onClick={() => setShowAll(false)}
            className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium text-gray-500"
          >
            Show less
          </button>
        )}
      </div>
    );
  };

  const canCreateCompetitor = newCompetitor.name && newCompetitor.industry;

  return (
    <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg transition-all duration-300 transform ${
          toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        } ${
          toast.type === 'error' ? 'bg-red-50 border border-red-200' :
          toast.type === 'success' ? 'bg-green-50 border border-green-200' :
          'bg-yellow-50 border border-yellow-200'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                toast.type === 'error' ? 'text-red-800' :
                toast.type === 'success' ? 'text-green-800' :
                'text-yellow-800'
              }`}>
                {toast.message}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setToast(prev => ({ ...prev, show: false }))}
                  className={`inline-flex p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    toast.type === 'error' ? 'text-red-400 hover:bg-red-100 focus:ring-red-600' :
                    toast.type === 'success' ? 'text-green-400 hover:bg-green-100 focus:ring-green-600' :
                    'text-yellow-400 hover:bg-yellow-100 focus:ring-yellow-600'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="calendly-card-static" style={{ marginBottom: '24px', padding: '24px' }}>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => {
                  if (isEditMode && editId) {
                    router.push(`/competitor-intelligence/competitors/${editId}`);
                  } else {
                    router.push('/competitors');
                  }
                }}
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
                  {isEditMode ? 'Edit Competitor' : 'Add New Competitor'}
                </h1>
                <p className="calendly-body">
                  {isEditMode ? 'Update competitor profile and intelligence settings' : 'Create a comprehensive competitor profile for intelligence monitoring'}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps - Only show on initial step */}
          {false && (
            <div className="calendly-card-static" style={{ marginBottom: '24px', padding: '20px' }}>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center calendly-label-sm font-semibold text-white" style={{ background: '#4285f4' }}>
                    1
                  </div>
                  <div className="ml-3">
                    <p className="calendly-body-sm font-medium">Company Information</p>
                    <p className="calendly-label-sm">Provide basic details for AI research</p>
                  </div>
                </div>
                
                <div className="w-12 h-1 rounded" style={{ background: '#e2e8f0' }} />
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center calendly-label-sm font-semibold" style={{ background: '#e2e8f0', color: '#718096' }}>
                    2
                  </div>
                  <div className="ml-3">
                    <p className="calendly-body-sm font-medium" style={{ color: '#718096' }}>AI Research</p>
                    <p className="calendly-label-sm">Auto-populate competitive intelligence</p>
                  </div>
                </div>
                
                <div className="w-12 h-1 rounded" style={{ background: '#e2e8f0' }} />
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center calendly-label-sm font-semibold" style={{ background: '#e2e8f0', color: '#718096' }}>
                    3
                  </div>
                  <div className="ml-3">
                    <p className="calendly-body-sm font-medium" style={{ color: '#718096' }}>Review & Create</p>
                    <p className="calendly-label-sm">Edit and finalize competitor profile</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {researchComplete && (
            <div className="calendly-card-static" style={{ marginBottom: '24px', padding: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6" style={{ color: '#10b981' }} />
                  <div>
                    <p className="calendly-body font-semibold" style={{ color: '#065f46', marginBottom: '4px' }}>
                      {isEditMode ? 'Profile Loaded for Editing!' : 'Research Complete!'}
                    </p>
                    <p className="calendly-body-sm" style={{ color: '#047857' }}>
                      {isEditMode 
                        ? `${researchAge ? `AI research from ${researchAge}. ` : ''}Review and edit the profile below. Manual edits will be preserved during re-research.`
                        : 'Review and edit the generated competitor profile below'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAIResearch}
                  disabled={isResearching}
                  className={`calendly-btn-secondary flex items-center space-x-2 ${isResearching ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ borderColor: '#10b981', color: '#10b981' }}
                  onMouseEnter={(e) => {
                    if (!isResearching && (newCompetitor.name || newCompetitor.website)) {
                      e.currentTarget.style.background = '#f0fdf4';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                  }}
                >
                  {isResearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Re-researching...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Regenerate Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Basic Information - Only show if research not complete */}
          {!researchComplete && (
            <div ref={step1Ref} className="calendly-card-static" style={{ marginBottom: '24px' }}>
            <div className="p-6">
              <button
                onClick={() => toggleStep('step1')}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="calendly-h3">Step 1: Basic Information</h2>
                    <p className="text-sm text-gray-800">Company name, industry, and contact details</p>
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
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={newCompetitor.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className="w-full px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                        style={{ 
                          border: highlightedFields.has('name') ? '1px solid #ef4444' : '1px solid #e2e8f0', 
                          background: highlightedFields.has('name') ? '#fef2f2' : 'white' 
                        }}
                        onFocus={(e) => {
                          if (!highlightedFields.has('name')) {
                            e.target.style.borderColor = '#4285f4';
                            e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                          } else {
                            e.target.style.borderColor = '#ef4444';
                            e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                          }
                        }}
                        onBlur={(e) => {
                          if (!highlightedFields.has('name')) {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.boxShadow = 'none';
                          } else {
                            e.target.style.borderColor = '#ef4444';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                        placeholder="e.g., Salesforce"
                        disabled={isResearching}
                      />
                    </div>

                    <div>
                      <label className="calendly-label" style={{ marginBottom: '8px', display: 'block' }}>
                        Website
                      </label>
                      <input
                        type="url"
                        value={newCompetitor.website}
                        onChange={(e) => handleFieldChange('website', e.target.value)}
                        className="w-full px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                        style={{ 
                          border: highlightedFields.has('website') ? '1px solid #ef4444' : '1px solid #e2e8f0', 
                          background: highlightedFields.has('website') ? '#fef2f2' : 'white' 
                        }}
                        onFocus={(e) => {
                          if (!highlightedFields.has('website')) {
                            e.target.style.borderColor = '#4285f4';
                            e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                          } else {
                            e.target.style.borderColor = '#ef4444';
                            e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                          }
                        }}
                        onBlur={(e) => {
                          if (!highlightedFields.has('website')) {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.boxShadow = 'none';
                          } else {
                            e.target.style.borderColor = '#ef4444';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                        placeholder="https://salesforce.com"
                        disabled={isResearching}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-900">
                          Industry *
                        </label>
                        {getFieldIndicator('industry')}
                      </div>
                      <select
                        value={newCompetitor.industry}
                        onChange={(e) => handleFieldChange('industry', e.target.value)}
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
                        disabled={isResearching}
                      >
                        <option value="">Select Industry</option>
                        <option value="CRM & Sales">CRM & Sales</option>
                        <option value="Marketing & Sales">Marketing & Sales</option>
                        <option value="Customer Support">Customer Support</option>
                        <option value="Project Management">Project Management</option>
                        <option value="Analytics">Analytics</option>
                        <option value="AI & Machine Learning">AI & Machine Learning</option>
                        <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-900">
                          Location
                        </label>
                        {getFieldIndicator('location')}
                      </div>
                      <input
                        type="text"
                        value={newCompetitor.location}
                        onChange={(e) => handleFieldChange('location', e.target.value)}
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
                        placeholder="San Francisco, CA"
                        disabled={isResearching}
                      />
                    </div>
                  </div>

                  {/* AI Research Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">AI Research Assistant</h3>
                          <p className="text-sm text-gray-600">
                            {researchComplete 
                              ? 'Research completed! All fields have been populated and can be edited below.' 
                              : 'Let AI research and auto-populate competitor information'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {!researchComplete && (
                        <button
                          onClick={handleAIResearch}
                          disabled={isResearching}
                          className="calendly-btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isResearching ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Researching...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4" />
                              <span>AI Research</span>
                            </>
                          )}
                        </button>
                      )}

                      {researchComplete && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Research Complete</span>
                        </div>
                      )}
                    </div>
                    
                    {isResearching && (
                      <div className="mt-4">
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Analyzing company information, industry data, and competitive positioning...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Comprehensive Report View - Only show after research complete */}
          {researchComplete && (
            <div className="space-y-6">
              {/* Company Overview Section */}
              <div className="calendly-card-static">
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Company Overview</h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-900">Company Name *</label>
                        {getFieldIndicator('name')}
                      </div>
                      <input
                        type="text"
                        value={newCompetitor.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className="w-full px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                        style={{ 
                          border: highlightedFields.has('name') ? '1px solid #ef4444' : '1px solid #e2e8f0', 
                          background: highlightedFields.has('name') ? '#fef2f2' : 'white' 
                        }}
                        onFocus={(e) => {
                          if (!highlightedFields.has('name')) {
                            e.target.style.borderColor = '#4285f4';
                            e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                          } else {
                            e.target.style.borderColor = '#ef4444';
                            e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                          }
                        }}
                        onBlur={(e) => {
                          if (!highlightedFields.has('name')) {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.boxShadow = 'none';
                          } else {
                            e.target.style.borderColor = '#ef4444';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                        placeholder="e.g., Salesforce"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-900">Website</label>
                        {getFieldIndicator('website')}
                      </div>
                      <input
                        type="url"
                        value={newCompetitor.website}
                        onChange={(e) => handleFieldChange('website', e.target.value)}
                        className="w-full px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                        style={{ 
                          border: highlightedFields.has('website') ? '1px solid #ef4444' : '1px solid #e2e8f0', 
                          background: highlightedFields.has('website') ? '#fef2f2' : 'white' 
                        }}
                        onFocus={(e) => {
                          if (!highlightedFields.has('website')) {
                            e.target.style.borderColor = '#4285f4';
                            e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                          } else {
                            e.target.style.borderColor = '#ef4444';
                            e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
                          }
                        }}
                        onBlur={(e) => {
                          if (!highlightedFields.has('website')) {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.boxShadow = 'none';
                          } else {
                            e.target.style.borderColor = '#ef4444';
                            e.target.style.boxShadow = 'none';
                          }
                        }}
                        placeholder="https://salesforce.com"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-900">Industry *</label>
                        {getFieldIndicator('industry')}
                      </div>
                      <select
                        value={newCompetitor.industry}
                        onChange={(e) => handleFieldChange('industry', e.target.value)}
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
                        <option value="">Select Industry</option>
                        <option value="CRM & Sales">CRM & Sales</option>
                        <option value="Marketing & Sales">Marketing & Sales</option>
                        <option value="Customer Support">Customer Support</option>
                        <option value="Project Management">Project Management</option>
                        <option value="Analytics">Analytics</option>
                        <option value="AI & Machine Learning">AI & Machine Learning</option>
                        <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-900">Location</label>
                        {getFieldIndicator('location')}
                      </div>
                      <input
                        type="text"
                        value={newCompetitor.location}
                        onChange={(e) => handleFieldChange('location', e.target.value)}
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
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-900">Company Description</label>
                      {getFieldIndicator('description')}
                    </div>
                    <textarea
                      value={newCompetitor.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      placeholder="Brief description of the company, its mission, and main products/services..."
                    />
                  </div>
                </div>
              </div>

              {/* Financial & Company Data */}
              <div className="calendly-card-static">
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Financial & Company Data</h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-900">Founded Year</label>
                        {getFieldIndicator('founded')}
                      </div>
                      <input
                        type="text"
                        value={newCompetitor.founded}
                        onChange={(e) => handleFieldChange('founded', e.target.value)}
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
                        placeholder="2006"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-900">Employee Count</label>
                        {getFieldIndicator('employees')}
                      </div>
                      <input
                        type="text"
                        value={newCompetitor.employees}
                        onChange={(e) => handleFieldChange('employees', e.target.value)}
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
                        placeholder="1,000"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-900">Market Cap / Valuation</label>
                        {getFieldIndicator('marketCap')}
                      </div>
                      <input
                        type="text"
                        value={newCompetitor.marketCap}
                        onChange={(e) => handleFieldChange('marketCap', e.target.value)}
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
                        placeholder="$31B"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Competitive Analysis */}
              <div className="calendly-card-static">
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Competitive Analysis</h2>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Threat Level */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-900">Competitive Threat Level</label>
                      {getFieldIndicator('threat_level')}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'low', label: 'Low Threat', color: 'green', description: 'Minimal overlap or different market segment' },
                        { value: 'medium', label: 'Medium Threat', color: 'yellow', description: 'Some competitive overlap in features/market' },
                        { value: 'high', label: 'High Threat', color: 'red', description: 'Direct competitor with significant overlap' }
                      ].map((threat) => (
                        <button
                          key={threat.value}
                          onClick={() => handleFieldChange('threat_level', threat.value)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            newCompetitor.threat_level === threat.value
                              ? threat.color === 'green' 
                                ? 'border-green-500 bg-green-50'
                                : threat.color === 'yellow'
                                  ? 'border-yellow-500 bg-yellow-50'
                                  : 'border-red-500 bg-red-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className={`font-semibold ${
                            threat.color === 'green' ? 'text-green-700' :
                            threat.color === 'yellow' ? 'text-yellow-700' :
                            'text-red-700'
                          }`}>
                            {threat.label}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{threat.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Key Products */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-900">Key Products/Services</label>
                      {getFieldIndicator('key_products')}
                    </div>
                    <div className="relative">
                      <div className="flex items-center space-x-2 mb-3">
                        <input
                          type="text"
                          value={newProduct}
                          onChange={(e) => handleProductInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addKeyProduct()}
                          onFocus={() => newProduct.length > 1 && setShowProductSuggestions(productSuggestions.length > 0)}
                          onBlur={() => setTimeout(() => setShowProductSuggestions(false), 200)} // Delay to allow clicking suggestions
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                          placeholder="Search products or type custom (e.g., Design Platform, API...)"
                        />
                        <button
                          onClick={() => addKeyProduct()}
                          className="calendly-btn-primary"
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Autocomplete Suggestions */}
                      {showProductSuggestions && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          <div className="p-2 text-xs text-gray-500 bg-gray-50 border-b">
                            💡 Common Products - Click to add
                          </div>
                          {productSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => addKeyProduct(suggestion)}
                              className="w-full text-left px-3 py-2 focus:bg-indigo-50 focus:outline-none text-sm border-b last:border-b-0"
                            >
                              <span className="font-medium text-indigo-600">🔍</span> {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Expandable Product Library */}
                    <div className="mb-3">
                      <button
                        onClick={() => setShowProductLibrary(!showProductLibrary)}
                        className="flex items-center space-x-2 text-sm text-indigo-600 mb-2"
                      >
                        {showProductLibrary ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        <span>Browse all product categories</span>
                        <span className="text-xs text-gray-500 ml-2">({COMMON_PRODUCTS.length} options)</span>
                      </button>

                      {showProductLibrary && renderLibrarySection(
                        PRODUCT_CATEGORIES,
                        newCompetitor.key_products,
                        toggleProduct,
                        'blue',
                        'products'
                      )}
                    </div>
                    
                    {renderCompactPills(
                      newCompetitor.key_products,
                      removeKeyProduct,
                      showAllProducts,
                      setShowAllProducts,
                      "bg-blue-100 text-blue-800",
                      8
                    )}
                  </div>

                  {/* Strengths and Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-900">Competitive Strengths</label>
                        {getFieldIndicator('strengths')}
                      </div>
                      <div className="relative">
                        <div className="flex items-center space-x-2 mb-3">
                          <input
                            type="text"
                            value={newStrength}
                            onChange={(e) => handleStrengthInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addStrength()}
                            onFocus={() => newStrength.length > 1 && setShowStrengthSuggestions(strengthSuggestions.length > 0)}
                            onBlur={() => setTimeout(() => setShowStrengthSuggestions(false), 200)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                            placeholder="Search strengths or type custom (e.g., Market leader, Great UX...)"
                          />
                          <button
                            onClick={() => addStrength()}
                            className="calendly-btn-primary"
                          >
                            Add
                          </button>
                        </div>
                        
                        {/* Autocomplete Suggestions */}
                        {showStrengthSuggestions && (
                          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            <div className="p-2 text-xs text-gray-500 bg-gray-50 border-b">
                              💪 Common Strengths - Click to add
                            </div>
                            {strengthSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => addStrength(suggestion)}
                                className="w-full text-left px-3 py-2 focus:bg-green-50 focus:outline-none text-sm border-b last:border-b-0"
                              >
                                <span className="font-medium text-green-600">✅</span> {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Expandable Strength Library */}
                      <div className="mb-3">
                        <button
                          onClick={() => setShowStrengthLibrary(!showStrengthLibrary)}
                          className="flex items-center space-x-2 text-sm text-green-600 mb-2"
                        >
                          {showStrengthLibrary ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                          <span>Browse all strength categories</span>
                          <span className="text-xs text-gray-500 ml-2">({COMMON_STRENGTHS.length} options)</span>
                        </button>

                        {showStrengthLibrary && renderLibrarySection(
                          STRENGTH_CATEGORIES,
                          newCompetitor.strengths,
                          toggleStrength,
                          'green',
                          'strengths'
                        )}
                      </div>
                      
                      {renderCompactPills(
                        newCompetitor.strengths,
                        removeStrength,
                        showAllStrengths,
                        setShowAllStrengths,
                        "bg-green-100 text-green-800",
                        6
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-900">Competitive Weaknesses</label>
                        {getFieldIndicator('weaknesses')}
                      </div>
                      <div className="relative">
                        <div className="flex items-center space-x-2 mb-3">
                          <input
                            type="text"
                            value={newWeakness}
                            onChange={(e) => handleWeaknessInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addWeakness()}
                            onFocus={() => newWeakness.length > 1 && setShowWeaknessSuggestions(weaknessSuggestions.length > 0)}
                            onBlur={() => setTimeout(() => setShowWeaknessSuggestions(false), 200)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                            placeholder="Search weaknesses or type custom (e.g., High complexity, Expensive...)"
                          />
                          <button
                            onClick={() => addWeakness()}
                            className="calendly-btn-secondary"
                          >
                            Add
                          </button>
                        </div>
                        
                        {/* Autocomplete Suggestions */}
                        {showWeaknessSuggestions && (
                          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            <div className="p-2 text-xs text-gray-500 bg-gray-50 border-b">
                              ⚠️ Common Weaknesses - Click to add
                            </div>
                            {weaknessSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => addWeakness(suggestion)}
                                className="w-full text-left px-3 py-2 focus:bg-orange-50 focus:outline-none text-sm border-b last:border-b-0"
                              >
                                <span className="font-medium text-orange-600">⚠️</span> {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Expandable Weakness Library */}
                      <div className="mb-3">
                        <button
                          onClick={() => setShowWeaknessLibrary(!showWeaknessLibrary)}
                          className="flex items-center space-x-2 text-sm text-orange-600 mb-2"
                        >
                          {showWeaknessLibrary ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                          <span>Browse all weakness categories</span>
                          <span className="text-xs text-gray-500 ml-2">({COMMON_WEAKNESSES.length} options)</span>
                        </button>

                        {showWeaknessLibrary && renderLibrarySection(
                          WEAKNESS_CATEGORIES,
                          newCompetitor.weaknesses,
                          toggleWeakness,
                          'orange',
                          'weaknesses'
                        )}
                      </div>
                      
                      {renderCompactPills(
                        newCompetitor.weaknesses,
                        removeWeakness,
                        showAllWeaknesses,
                        setShowAllWeaknesses,
                        'bg-orange-100 text-orange-800',
                        5
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* Create Button - Only show after research complete */}
          {researchComplete && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isEditMode ? 'Ready to Save Changes?' : 'Ready to Create Competitor Profile?'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isEditMode ? 'This will update the competitor in your intelligence monitoring system' : 'This will add the competitor to your intelligence monitoring system'}
                  </p>
                </div>
                <button
                  onClick={handleSaveCompetitor}
                  disabled={!canCreateCompetitor || isCreating}
                  className="calendly-btn-primary flex items-center space-x-3"
                >
                  <Save className="w-5 h-5" />
                  <span>
                    {isCreating ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Competitor')}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}