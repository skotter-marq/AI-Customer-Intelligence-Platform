'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowLeft,
  Bot,
  Target,
  Activity,
  Users,
  TrendingUp,
  ArrowRight,
  Calendar,
  Settings,
  Mail,
  Building,
  BarChart3,
  FileText,
  Zap,
  PieChart,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Edit,
  Check,
  Eye,
  Plus,
  X,
  RefreshCw,
  User,
  Trash2
} from 'lucide-react';

interface SelectedAccount {
  id: string;
  company_name: string;
  account_tier: string;
  status: string;
  primary_contact: string;
}

function CreateAgentPageContent() {
  const searchParams = useSearchParams();
  const entryPoint = searchParams?.get('from') || 'agents';
  
  const [selectedAccounts, setSelectedAccounts] = useState<SelectedAccount[]>([]);
  const [step, setStep] = useState<'category' | 'select' | 'configure' | 'confirm'>('category');
  const [agentCategory, setAgentCategory] = useState<'customer-facing' | 'research' | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentConfig, setAgentConfig] = useState({
    purpose: '',
    ai_suggestions_enabled: true,
    outreach_frequency: '3days' as 'daily' | '3days' | 'weekly' | 'biweekly',
    max_attempts: 5,
    contact_methods: ['email'] as ('email' | 'phone' | 'linkedin')[],
    tone: 'professional' as 'friendly' | 'professional' | 'casual',
    message_style: 'concise' as 'concise' | 'detailed' | 'personalized',
    custom_message: '',
    research_frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    data_sources: ['web'] as ('web' | 'internal' | 'apis' | 'reports' | 'social' | 'news' | 'financial' | 'patents')[],
    report_format: 'executive' as 'executive' | 'detailed' | 'dashboard' | 'narrative',
    auto_insights: true,
    notification_threshold: 'medium' as 'low' | 'medium' | 'high',
    analysis_framework: '',
    success_metric: 'insights_quality' as 'insights_quality' | 'trend_accuracy' | 'actionability' | 'coverage_completeness',
    escalation_rules: '',
    confidence_threshold: 'medium' as 'high' | 'medium' | 'low' | 'experimental',
    business_context: ''
  });

  const [showManualConfig, setShowManualConfig] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [showResearchConfig, setShowResearchConfig] = useState(false);
  const [researchPrompt, setResearchPrompt] = useState('');
  
  // Email template states
  const [showEmailTemplates, setShowEmailTemplates] = useState(false);
  const [templatesExpanded, setTemplatesExpanded] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [exampleEmail, setExampleEmail] = useState('');
  const [stepsCollapsed, setStepsCollapsed] = useState({
    agentSelection: false,
    configuration: false,
    competitorSelection: false,
    generateTemplates: false,
    customerSelection: false,
    emailTemplates: false
  });
  const [stepsCompleted, setStepsCompleted] = useState({
    agentSelection: false,
    configuration: false,
    competitorSelection: false,
    generateTemplates: false,
    customerSelection: false,
    complete: false
  });
  const [selectedEmailTab, setSelectedEmailTab] = useState('initial_outreach');
  const [showToast, setShowToast] = useState(false);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState<string | null>(null);
  const [templatesGenerated, setTemplatesGenerated] = useState(false);
  const [configChanged, setConfigChanged] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState({
    initial_outreach: '',
    follow_up_1: '',
    follow_up_2: '',
    meeting_request: '',
    final_attempt: ''
  });
  const [emailSubjects, setEmailSubjects] = useState({
    initial_outreach: '',
    follow_up_1: '',
    follow_up_2: '',
    meeting_request: '',
    final_attempt: ''
  });

  // Customer/Competitor selection states
  const [showCustomerSelection, setShowCustomerSelection] = useState(false);
  const [showCompetitorSelection, setShowCompetitorSelection] = useState(false);
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [competitorSearchQuery, setCompetitorSearchQuery] = useState('');
  
  // Recipient management states
  const [showRecipientList, setShowRecipientList] = useState(false);
  const [recipients, setRecipients] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'Admin' | 'User';
    title: string;
    accountId: string;
    accountName: string;
    source: 'auto' | 'manual';
  }[]>([]);
  const [editingRecipient, setEditingRecipient] = useState<string | null>(null);
  const [newRecipient, setNewRecipient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    title: '',
    company: '',
    customerId: ''
  });
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [hubspotEnrollment, setHubspotEnrollment] = useState<{[key: string]: boolean}>({});
  
  // Research agent specific states
  const [showFocusLibrary, setShowFocusLibrary] = useState(false);
  const [showAnalysisLibrary, setShowAnalysisLibrary] = useState(false);
  const [showEscalationLibrary, setShowEscalationLibrary] = useState(false);
  const [showAllFocus, setShowAllFocus] = useState(false);
  const [showAllAnalysis, setShowAllAnalysis] = useState(false);
  const [showAllEscalation, setShowAllEscalation] = useState(false);

  // Mock data
  const mockCustomers = [
    { 
      id: 'customer-001', 
      name: 'MarketingCorp', 
      tier: 'Growth', 
      status: 'Active',
      contacts: [
        { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@marketingcorp.com', title: 'VP Marketing' },
        { firstName: 'Mike', lastName: 'Chen', email: 'mike.chen@marketingcorp.com', title: 'Marketing Manager' }
      ]
    },
    { 
      id: 'customer-002', 
      name: 'TechStart Inc', 
      tier: 'Starter', 
      status: 'Active',
      contacts: [
        { firstName: 'David', lastName: 'Wilson', email: 'david@techstart.com', title: 'Founder & CEO' }
      ]
    },
    { 
      id: 'customer-003', 
      name: 'GlobalCorp', 
      tier: 'Enterprise', 
      status: 'Active',
      contacts: [
        { firstName: 'Jennifer', lastName: 'Martinez', email: 'j.martinez@globalcorp.com', title: 'Director of Operations' },
        { firstName: 'Robert', lastName: 'Lee', email: 'r.lee@globalcorp.com', title: 'Senior Manager' },
        { firstName: 'Lisa', lastName: 'Brown', email: 'l.brown@globalcorp.com', title: 'Project Manager' }
      ]
    },
    { id: 'customer-004', name: 'InnovateTech', tier: 'Starter', status: 'Onboarding', contacts: [] },
    { 
      id: 'customer-005', 
      name: 'FinancePlus', 
      tier: 'Growth', 
      status: 'At Risk',
      contacts: [
        { firstName: 'Amanda', lastName: 'Davis', email: 'amanda@financeplus.com', title: 'CFO' }
      ]
    },
    { id: 'customer-006', name: 'DataFlow Systems', tier: 'Enterprise', status: 'Active', contacts: [] },
    { id: 'customer-007', name: 'CloudScale Inc', tier: 'Growth', status: 'Active', contacts: [] },
    { id: 'customer-008', name: 'AutomateMe', tier: 'Starter', status: 'Active', contacts: [] },
    { id: 'customer-009', name: 'SecureNet', tier: 'Enterprise', status: 'Active', contacts: [] },
    { id: 'customer-010', name: 'ScaleUp Solutions', tier: 'Growth', status: 'Active', contacts: [] },
    { id: 'customer-011', name: 'DevOps Pro', tier: 'Starter', status: 'Active', contacts: [] },
    { id: 'customer-012', name: 'Analytics Plus', tier: 'Growth', status: 'At Risk', contacts: [] }
  ];

  const mockCompetitors = [
    { id: 'comp-001', name: 'Salesforce', category: 'CRM Platform', marketCap: 'Large' },
    { id: 'comp-002', name: 'HubSpot', category: 'Marketing Automation', marketCap: 'Medium' },
    { id: 'comp-003', name: 'Pipedrive', category: 'Sales CRM', marketCap: 'Small' },
    { id: 'comp-004', name: 'Marketo', category: 'Marketing Automation', marketCap: 'Medium' },
    { id: 'comp-005', name: 'Pardot', category: 'B2B Marketing', marketCap: 'Large' },
    { id: 'comp-006', name: 'ActiveCampaign', category: 'Email Marketing', marketCap: 'Small' },
    { id: 'comp-007', name: 'Mailchimp', category: 'Email Marketing', marketCap: 'Medium' },
    { id: 'comp-008', name: 'ConvertKit', category: 'Creator Marketing', marketCap: 'Small' },
    { id: 'comp-009', name: 'Constant Contact', category: 'Email Marketing', marketCap: 'Small' },
    { id: 'comp-010', name: 'Zoho CRM', category: 'CRM Platform', marketCap: 'Medium' },
    { id: 'comp-011', name: 'Monday.com', category: 'Project Management', marketCap: 'Medium' },
    { id: 'comp-012', name: 'Asana', category: 'Project Management', marketCap: 'Medium' }
  ];

  // Mock contact data for accounts
  const mockAccountContacts = {
    'customer-001': [
      { firstName: 'John', lastName: 'Smith', email: 'john.smith@marketingcorp.com', role: 'Admin' as const, title: 'VP Marketing' },
      { firstName: 'Sarah', lastName: 'Connor', email: 'sarah.connor@marketingcorp.com', role: 'User' as const, title: 'Marketing Manager' },
      { firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@marketingcorp.com', role: 'User' as const, title: 'Campaign Specialist' }
    ],
    'customer-002': [
      { firstName: 'Lisa', lastName: 'Wong', email: 'lisa.wong@techstart.com', role: 'Admin' as const, title: 'CTO' },
      { firstName: 'David', lastName: 'Chen', email: 'david.chen@techstart.com', role: 'User' as const, title: 'Product Manager' }
    ],
    'customer-003': [
      { firstName: 'Robert', lastName: 'Kim', email: 'robert.kim@globalcorp.com', role: 'Admin' as const, title: 'Director of Operations' },
      { firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@globalcorp.com', role: 'Admin' as const, title: 'VP Sales' },
      { firstName: 'James', lastName: 'Wilson', email: 'james.wilson@globalcorp.com', role: 'User' as const, title: 'Operations Manager' }
    ],
    'customer-004': [
      { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@innovatetech.com', role: 'Admin' as const, title: 'CEO' },
      { firstName: 'Alex', lastName: 'Turner', email: 'alex.turner@innovatetech.com', role: 'User' as const, title: 'Tech Lead' }
    ],
    'customer-005': [
      { firstName: 'Amanda', lastName: 'Davis', email: 'amanda.davis@financeplus.com', role: 'Admin' as const, title: 'CFO' },
      { firstName: 'Tom', lastName: 'Brown', email: 'tom.brown@financeplus.com', role: 'User' as const, title: 'Financial Analyst' }
    ]
  };

  const filteredCustomers = mockCustomers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.tier.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.status.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );
  
  const filteredCompetitors = mockCompetitors.filter(competitor => 
    competitor.name.toLowerCase().includes(competitorSearchQuery.toLowerCase()) ||
    competitor.category.toLowerCase().includes(competitorSearchQuery.toLowerCase()) ||
    competitor.marketCap.toLowerCase().includes(competitorSearchQuery.toLowerCase())
  );

  // Auto-generate recipients when customers are selected
  React.useEffect(() => {
    const autoRecipients = selectedCustomers.flatMap(customerId => {
      const customer = mockCustomers.find(c => c.id === customerId);
      const contacts = mockAccountContacts[customerId as keyof typeof mockAccountContacts] || [];
      
      return contacts.map((contact, index) => ({
        id: `${customerId}-${index}`,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        role: contact.role,
        title: contact.title,
        accountId: customerId,
        accountName: customer?.name || 'Unknown Account',
        source: 'auto' as const
      }));
    });
    
    setRecipients(prev => {
      const manualRecipients = prev.filter(r => r.source === 'manual');
      return [...manualRecipients, ...autoRecipients];
    });
    
    if (selectedCustomers.length > 0) {
      setShowRecipientList(true);
    }
  }, [selectedCustomers]);

  const customerFacingAgents = [
    {
      id: 'agent-renewal-001',
      name: 'Renewal Outreach Agent',
      type: 'Renewal Specialist',
      description: 'Proactively contacts accounts approaching renewal dates',
      icon: Target,
      color: 'blue'
    },
    {
      id: 'agent-health-001', 
      name: 'Health Recovery Agent',
      type: 'Health Specialist',
      description: 'Engages with at-risk accounts to improve health scores',
      icon: Activity,
      color: 'red'
    },
    {
      id: 'agent-onboard-001',
      name: 'Onboarding Agent', 
      type: 'Onboarding Specialist',
      description: 'Guides new customers through product adoption',
      icon: Users,
      color: 'green'
    },
    {
      id: 'agent-expansion-001',
      name: 'Expansion Agent',
      type: 'Growth Specialist', 
      description: 'Identifies and pursues expansion opportunities',
      icon: TrendingUp,
      color: 'yellow'
    }
  ];

  const researchAgents = [
    {
      id: 'research-competitive-001',
      name: 'Competitive Intelligence Agent',
      type: 'Research Analyst',
      description: 'Monitors competitor activities, pricing changes, and market positioning',
      icon: BarChart3,
      color: 'purple'
    },
    {
      id: 'research-market-001',
      name: 'Market Research Agent',
      type: 'Market Analyst',
      description: 'Analyzes market trends, industry reports, and customer sentiment',
      icon: PieChart,
      color: 'indigo'
    },
    {
      id: 'research-product-001',
      name: 'Product Intelligence Agent',
      type: 'Product Analyst',
      description: 'Tracks product usage patterns, feature adoption, and user feedback',
      icon: Zap,
      color: 'orange'
    },
    {
      id: 'research-content-001',
      name: 'Content Strategy Agent',
      type: 'Content Analyst',
      description: 'Analyzes content performance and identifies optimization opportunities',
      icon: FileText,
      color: 'teal'
    }
  ];

  const availableAgents = agentCategory === 'customer-facing' ? customerFacingAgents : researchAgents;

  // Helper function for rendering compact pills (for research configuration)
  const renderCompactPills = (items: string[], onRemove: (index: number) => void, showAll: boolean, setShowAll: (show: boolean) => void, colorClasses: string, maxVisible: number = 4) => {
    const visibleItems = showAll ? items : items.slice(0, maxVisible);
    const hiddenCount = items.length - maxVisible;
    
    return (
      <div className="flex flex-wrap gap-2">
        {visibleItems.map((item, index) => (
          <span key={index} className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClasses}`}>
            {item}
            <button
              onClick={() => onRemove(showAll ? index : index)}
              className="ml-2 text-current hover:text-opacity-70"
            >
              ×
            </button>
          </span>
        ))}
        {!showAll && hiddenCount > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
          >
            +{hiddenCount} more
          </button>
        )}
        {showAll && items.length > maxVisible && (
          <button
            onClick={() => setShowAll(false)}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
          >
            Show less
          </button>
        )}
      </div>
    );
  };

  // Track when Step 1 (agent selection) changes after templates are generated
  useEffect(() => {
    if (templatesGenerated && selectedAgent) {
      setConfigChanged(true);
    }
  }, [selectedAgent, templatesGenerated]);

  // Track when Step 2 (configuration) changes after templates are generated
  useEffect(() => {
    if (templatesGenerated) {
      setConfigChanged(true);
    }
  }, [agentConfig.outreach_frequency, agentConfig.max_attempts, exampleEmail, templatesGenerated]);

  // Initialize HubSpot contacts as enrolled when customers are selected
  useEffect(() => {
    const newEnrollment: {[key: string]: boolean} = {};
    selectedCustomers.forEach(customerId => {
      const customer = mockCustomers.find(c => c.id === customerId);
      if (customer && customer.contacts) {
        customer.contacts.forEach((contact, index) => {
          const contactId = `hubspot-${customerId}-${index}`;
          if (!(contactId in hubspotEnrollment)) {
            newEnrollment[contactId] = true; // Default to enrolled
          }
        });
      }
    });
    
    if (Object.keys(newEnrollment).length > 0) {
      setHubspotEnrollment(prev => ({ ...prev, ...newEnrollment }));
    }
  }, [selectedCustomers, hubspotEnrollment]);

  useEffect(() => {
    // Load selected accounts from localStorage if coming from customers page
    const selectedAccountIds = JSON.parse(localStorage.getItem('selectedAccountsForAgent') || '[]');
    
    if (entryPoint === 'customers' && selectedAccountIds.length > 0) {
      setAgentCategory('customer-facing');
      setStep('select');
      
      const mockAccounts = [
        { id: 'account-001', company_name: 'MarketingCorp', account_tier: 'Growth', status: 'Active', primary_contact: 'John Smith' },
        { id: 'account-002', company_name: 'TechStart Inc', account_tier: 'Starter', status: 'Active', primary_contact: 'Lisa Wong' },
        { id: 'account-003', company_name: 'GlobalCorp', account_tier: 'Enterprise', status: 'Active', primary_contact: 'Robert Kim' },
        { id: 'account-004', company_name: 'InnovateTech', account_tier: 'Starter', status: 'Onboarding', primary_contact: 'Sarah Johnson' },
        { id: 'account-005', company_name: 'FinancePlus', account_tier: 'Growth', status: 'At Risk', primary_contact: 'Amanda Davis' }
      ];

      const accounts = mockAccounts.filter(account => selectedAccountIds.includes(account.id));
      setSelectedAccounts(accounts);
      
      const preselectedCustomerIds = accounts.map(account => {
        const customerMapping = {
          'account-001': 'customer-001',
          'account-002': 'customer-002',
          'account-003': 'customer-003',
          'account-004': 'customer-004',
          'account-005': 'customer-005'
        };
        return customerMapping[account.id as keyof typeof customerMapping];
      }).filter(Boolean);
      
      setSelectedCustomers(preselectedCustomerIds);
    } else {
      setStep('category');
      setAgentCategory(null);
      setSelectedAccounts([]);
    }
  }, [entryPoint]);

  // Generate email templates
  const handleCompleteSetup = async () => {
    try {
      // Collect all enrolled recipients
      const enrolledRecipients = [];
      
      // HubSpot contacts
      selectedCustomers.forEach(customerId => {
        const customer = mockCustomers.find(c => c.id === customerId);
        if (customer && customer.contacts) {
          customer.contacts.forEach((contact, index) => {
            const contactId = `hubspot-${customerId}-${index}`;
            if (hubspotEnrollment[contactId] !== false) {
              enrolledRecipients.push({
                id: contactId,
                firstName: contact.firstName,
                lastName: contact.lastName,
                email: contact.email,
                title: contact.title || '',
                company: customer.name,
                source: 'hubspot'
              });
            }
          });
        }
      });
      
      // Manual recipients
      recipients.forEach(recipient => {
        if (recipient.enrolled !== false) {
          const customer = mockCustomers.find(c => c.id === recipient.customerId);
          enrolledRecipients.push({
            ...recipient,
            company: customer?.name || recipient.company || 'Unknown',
            source: 'manual'
          });
        }
      });

      // Create agent configuration
      const agentConfiguration = {
        id: Date.now().toString(),
        name: selectedAgent,
        category: agentCategory,
        config: agentConfig,
        emailTemplates: agentCategory === 'customer-facing' ? emailTemplates : {},
        recipients: enrolledRecipients,
        selectedCustomers: selectedCustomers.map(id => {
          const customer = mockCustomers.find(c => c.id === id);
          return customer ? { id: customer.id, name: customer.name } : null;
        }).filter(Boolean),
        selectedCompetitors: agentCategory === 'research' ? selectedCompetitors.map(id => {
          const competitor = mockCompetitors.find(c => c.id === id);
          return competitor ? { id: competitor.id, name: competitor.name, category: competitor.category } : null;
        }).filter(Boolean) : [],
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      // Save to localStorage (in a real app, this would be an API call)
      const existingAgents = JSON.parse(localStorage.getItem('createdAgents') || '[]');
      existingAgents.push(agentConfiguration);
      localStorage.setItem('createdAgents', JSON.stringify(existingAgents));

      // Show success state
      setStepsCompleted(prev => ({...prev, complete: true}));
      
      // Show success toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Redirect after a short delay
      setTimeout(() => {
        if (entryPoint === 'customers') {
          window.location.href = '/customers';
        } else {
          window.location.href = '/agents';
        }
      }, 2000);

    } catch (error) {
      console.error('Error completing setup:', error);
      // Could show an error toast here
    }
  };

  const generateEmailTemplates = () => {
    if (agentCategory === 'research') return;
    
    const agent = availableAgents.find(a => a.id === selectedAgent);
    if (!agent) return;

    const toneAdjustment = exampleEmail ? 
      `Following the tone and style from this example: "${exampleEmail.substring(0, 200)}..."` : 
      `Using a ${agentConfig.tone} tone with ${agentConfig.message_style} messaging`;

    const templates = {
      initial_outreach: exampleEmail ? 
        `Hi {{contact_name}},

${exampleEmail.includes('Hope') || exampleEmail.includes('hope') ? 'I hope this finds you well.' : 'I wanted to reach out to you.'} I've been reviewing {{company_name}}'s account and ${agent.type === 'Renewal Specialist' ? 'wanted to discuss your upcoming renewal' : agent.type === 'Health Specialist' ? 'noticed some optimization opportunities' : agent.type === 'Onboarding Specialist' ? 'wanted to check on your onboarding progress' : 'see how we can help drive growth'}.

${agentConfig.purpose ? 'Specifically, I\'d like to ' + agentConfig.purpose.toLowerCase() + '.' : ''}

Would you have time for a brief call this week?

${exampleEmail.includes('Best') ? 'Best regards,' : exampleEmail.includes('Thanks') ? 'Thanks,' : 'Best,'}
{{agent_name}}` :
        `Hi {{contact_name}},

I hope this message finds you well. I'm reaching out because I've been reviewing {{company_name}}'s account and wanted to discuss ${agent.type === 'Renewal Specialist' ? 'your upcoming renewal and how we can continue supporting your success' : agent.type === 'Health Specialist' ? 'some opportunities to optimize your platform usage' : agent.type === 'Onboarding Specialist' ? 'your onboarding progress and next steps' : 'some growth opportunities for your team'}.

${agentConfig.purpose ? 'Specifically, I\'d like to ' + agentConfig.purpose.toLowerCase() + '.' : ''}

Would you have 15 minutes this week for a quick call?

Best regards,
{{agent_name}}`,

      follow_up_1: `Hi {{contact_name}},

I wanted to follow up on my previous message about ${agent.type === 'Renewal Specialist' ? 'your renewal planning' : agent.type === 'Health Specialist' ? 'optimizing your platform usage' : agent.type === 'Onboarding Specialist' ? 'your onboarding journey' : 'growth opportunities'}.

I've prepared some insights specific to {{company_name}}'s usage patterns that could be valuable for your team.

Would you prefer a quick call or should I send over the analysis?

Best,
{{agent_name}}`,

      follow_up_2: `Hi {{contact_name}},

I don't want to overwhelm your inbox, but I believe there's a real opportunity to ${agent.type === 'Renewal Specialist' ? 'ensure a smooth renewal process' : agent.type === 'Health Specialist' ? 'improve your platform ROI' : agent.type === 'Onboarding Specialist' ? 'accelerate your time-to-value' : 'unlock additional value from the platform'}.

If now isn't the right time, could you suggest when might work better?

Thanks,
{{agent_name}}`,

      meeting_request: `Hi {{contact_name}},

Thank you for your interest! I'd love to schedule a brief meeting to discuss ${agent.type === 'Renewal Specialist' ? 'your renewal and future goals' : agent.type === 'Health Specialist' ? 'optimization strategies' : agent.type === 'Onboarding Specialist' ? 'your implementation roadmap' : 'growth opportunities'}.

I have availability:
- Tomorrow at 2 PM
- Thursday at 10 AM  
- Friday at 3 PM

Which works best for you?

Looking forward to our conversation,
{{agent_name}}`,

      final_attempt: `Hi {{contact_name}},

This will be my final outreach regarding ${agent.type === 'Renewal Specialist' ? 'your upcoming renewal discussion' : agent.type === 'Health Specialist' ? 'platform optimization opportunities' : agent.type === 'Onboarding Specialist' ? 'your onboarding support' : 'growth strategies for your team'}.

If you'd like to connect in the future, please don't hesitate to reach out. I'm here whenever you're ready.

Best of luck with everything,
{{agent_name}}`
    };

    // Generate subjects for each template
    const subjects = {
      initial_outreach: agent.type === 'Renewal Specialist' ? 'Your upcoming renewal - let\'s discuss next steps' :
                       agent.type === 'Health Specialist' ? 'Quick optimization opportunity for {{company_name}}' :
                       agent.type === 'Onboarding Specialist' ? 'How is your onboarding going?' :
                       'Partnership opportunity for {{company_name}}',
      follow_up_1: 'Following up on our conversation',
      follow_up_2: 'Still interested in exploring this together?',
      meeting_request: 'Quick 15-minute call to discuss {{company_name}}\'s goals',
      final_attempt: 'Last chance to connect - is this still a priority?'
    };

    setEmailTemplates(templates);
    setEmailSubjects(subjects);
    setShowEmailTemplates(true);
    setTemplatesExpanded(true);
    setTemplatesGenerated(true);
    setConfigChanged(false);
  };
  
  // Individual template rewrite function
  const rewriteTemplate = (templateKey: string) => {
    const agent = availableAgents.find(a => a.id === selectedAgent);
    if (!agent) return;

    const currentTemplate = emailTemplates[templateKey as keyof typeof emailTemplates];
    if (!currentTemplate) return;

    let rewrittenTemplate = '';
    
    switch (templateKey) {
      case 'initial_outreach':
        rewrittenTemplate = exampleEmail ? 
          `Hi {{contact_name}},

${exampleEmail.includes('Hope') || exampleEmail.includes('hope') ? 'I hope you\'re doing well.' : 'I wanted to reach out to you personally.'} I\'ve been looking into {{company_name}}\'s account and ${agent.type === 'Renewal Specialist' ? 'wanted to discuss your renewal timeline' : agent.type === 'Health Specialist' ? 'identified some growth opportunities' : agent.type === 'Onboarding Specialist' ? 'wanted to ensure your implementation is on track' : 'see how we can accelerate your success'}.

${agentConfig.purpose ? 'I\'d specifically like to help with ' + agentConfig.purpose.toLowerCase() + '.' : ''}

Would you be available for a brief conversation this week?

${exampleEmail.includes('Best') ? 'Best regards,' : exampleEmail.includes('Thanks') ? 'Thanks,' : 'Best,'}
{{agent_name}}` :
          `Hi {{contact_name}},

I hope this finds you well. I\'ve been analyzing {{company_name}}\'s usage and wanted to share some ${agent.type === 'Renewal Specialist' ? 'renewal insights that could benefit your team' : agent.type === 'Health Specialist' ? 'optimization opportunities I discovered' : agent.type === 'Onboarding Specialist' ? 'implementation best practices' : 'growth strategies tailored to your goals'}.

${agentConfig.purpose ? 'Particularly around ' + agentConfig.purpose.toLowerCase() + '.' : ''}

Would you have 15 minutes this week to discuss?

Best regards,
{{agent_name}}`;
        break;
      
      case 'follow_up_1':
        rewrittenTemplate = `Hi {{contact_name}},

I wanted to circle back on my previous message regarding ${agent.type === 'Renewal Specialist' ? 'your upcoming renewal' : agent.type === 'Health Specialist' ? 'platform optimization' : agent.type === 'Onboarding Specialist' ? 'your implementation' : 'growth opportunities'}.

I\'ve put together some specific recommendations for {{company_name}} that I think you\'ll find valuable.

Would you prefer a quick call, or should I send over the details?

Best,
{{agent_name}}`;
        break;
      
      case 'follow_up_2':
        rewrittenTemplate = `Hi {{contact_name}},

I know your inbox is busy, but I wanted to reach out once more about ${agent.type === 'Renewal Specialist' ? 'ensuring a smooth renewal process' : agent.type === 'Health Specialist' ? 'maximizing your platform value' : agent.type === 'Onboarding Specialist' ? 'completing your successful onboarding' : 'unlocking additional growth potential'}.

If the timing isn\'t right now, when would be a better time to connect?

Thanks for your time,
{{agent_name}}`;
        break;
      
      case 'meeting_request':
        rewrittenTemplate = `Hi {{contact_name}},

Great to hear from you! I\'d love to schedule a brief discussion about ${agent.type === 'Renewal Specialist' ? 'your renewal strategy and future goals' : agent.type === 'Health Specialist' ? 'optimization opportunities' : agent.type === 'Onboarding Specialist' ? 'your implementation roadmap' : 'growth acceleration strategies'}.

I have these times available:
- Tomorrow at 3 PM
- Thursday at 11 AM
- Friday at 2 PM

Which works best for your schedule?

Looking forward to our conversation,
{{agent_name}}`;
        break;
      
      case 'final_attempt':
        rewrittenTemplate = `Hi {{contact_name}},

This will be my final outreach, as I don\'t want to overwhelm you with messages.

I genuinely believe there\'s an opportunity to ${agent.type === 'Renewal Specialist' ? 'ensure your renewal goes smoothly and delivers maximum value' : agent.type === 'Health Specialist' ? 'significantly improve your platform ROI' : agent.type === 'Onboarding Specialist' ? 'accelerate your time-to-value' : 'drive meaningful growth for your team'}.

If you\'d like to explore this, I\'m here to help. Otherwise, I wish you continued success.

Best regards,
{{agent_name}}`;
        break;
    }
    
    setEmailTemplates({
      ...emailTemplates,
      [templateKey]: rewrittenTemplate
    });
  };

  // Recipient management functions
  const addManualRecipient = () => {
    if (!newRecipient.firstName || !newRecipient.lastName || !newRecipient.email) {
      return;
    }
    
    const recipient = {
      id: `manual-${Date.now()}`,
      firstName: newRecipient.firstName,
      lastName: newRecipient.lastName,
      email: newRecipient.email,
      role: newRecipient.role,
      title: newRecipient.title,
      accountId: newRecipient.accountId,
      accountName: newRecipient.accountName,
      source: 'manual' as const
    };
    
    setRecipients(prev => [...prev, recipient]);
    setNewRecipient({
      firstName: '',
      lastName: '',
      email: '',
      role: 'User',
      title: '',
      accountId: '',
      accountName: ''
    });
    setShowAddRecipient(false);
  };
  
  const removeRecipient = (recipientId: string) => {
    setRecipients(prev => prev.filter(r => r.id !== recipientId));
  };

  const handleNext = () => {
    if (step === 'category' && agentCategory) {
      setStep('select');
    } else if (step === 'select' && selectedAgent) {
      if (agentCategory === 'research') {
        // For research agents, go directly to confirm since select includes configuration
        if (!agentConfig.purpose) {
          return;
        }
        setStep('confirm');
      } else if (agentCategory === 'customer-facing') {
        // For customer-facing agents, go directly to confirm since select includes configuration
        setStep('confirm');
      } else {
        setStep('configure');
      }
    } else if (step === 'configure') {
      if (agentCategory === 'research' && !agentConfig.purpose) {
        return;
      }
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'select') {
      if (entryPoint === 'customers') {
        window.location.href = '/customers';
      } else {
        setStep('category');
      }
    } else if (step === 'configure') {
      setStep('select');
    } else if (step === 'confirm') {
      if (agentCategory === 'research' || agentCategory === 'customer-facing') {
        // For research and customer-facing agents, go back to select since it includes configuration
        setStep('select');
      } else {
        setStep('configure');
      }
    } else if (step === 'category') {
      window.location.href = '/agents';
    }
  };

  const handleCreateAgent = () => {
    const agent = availableAgents.find(a => a.id === selectedAgent);
    if (!agent) return;

    const newAgent = {
      id: selectedAgent,
      name: agent.name,
      type: agent.type,
      description: agent.description,
      status: 'active',
      created_at: new Date().toISOString(),
      assigned_accounts: agentCategory === 'customer-facing' ? selectedAccounts.length : 0,
      total_contacts: 0,
      success_rate: 0,
      last_activity: new Date().toISOString(),
      category: agentCategory,
      configuration: agentConfig,
      performance: agentCategory === 'research' ? {
        emails_sent: 0,
        responses_received: 0,
        meetings_scheduled: 0,
        deals_influenced: 0,
        reports_generated: 0,
        insights_discovered: 0
      } : {
        emails_sent: 0,
        responses_received: 0,
        meetings_scheduled: 0,
        deals_influenced: 0
      }
    };

    const existingAgents = JSON.parse(localStorage.getItem('activeAgents') || '[]');
    existingAgents.push(newAgent);
    localStorage.setItem('activeAgents', JSON.stringify(existingAgents));

    localStorage.removeItem('selectedAccountsForAgent');

    const accountText = agentCategory === 'customer-facing' && selectedAccounts.length > 0 
      ? ` for ${selectedAccounts.length} account${selectedAccounts.length !== 1 ? 's' : ''}` 
      : '';
    alert(`Successfully created ${agent.name}${accountText}!`);
    window.location.href = '/agents';
  };

  const getStepColor = (currentStep: string) => {
    const stepOrder = selectedAccounts.length > 0 
      ? ['select', 'configure', 'confirm']
      : ['category', 'select', 'configure', 'confirm'];
    const currentIndex = stepOrder.indexOf(step);
    const checkIndex = stepOrder.indexOf(currentStep);
    
    if (checkIndex < currentIndex) return 'bg-green-500';
    if (checkIndex === currentIndex) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const renderCategorySelection = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Agent</h1>
        <p className="text-lg text-gray-600">Choose the type of agent you'd like to create</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={() => setAgentCategory('customer-facing')}
          className={`relative p-8 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md ${
            agentCategory === 'customer-facing'
              ? 'border-blue-500 bg-blue-50 shadow-sm'
              : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
          }`}
        >
          {agentCategory === 'customer-facing' && (
            <div className="absolute top-4 right-4">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h5 className="text-xl font-semibold text-gray-900 mb-2">Customer-Facing Agent</h5>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Direct Customer Interaction
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            Agents that directly communicate with your customers for renewals, health checks, onboarding, and expansion opportunities.
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Email and phone outreach</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Meeting scheduling</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Account assignment and tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Success rate monitoring</span>
            </div>
          </div>
        </button>

        <button
          onClick={() => setAgentCategory('research')}
          className={`relative p-8 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md ${
            agentCategory === 'research'
              ? 'border-purple-500 bg-purple-50 shadow-sm'
              : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
          }`}
        >
          {agentCategory === 'research' && (
            <div className="absolute top-4 right-4">
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h5 className="text-xl font-semibold text-gray-900 mb-2">Research Agent</h5>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                Analysis & Intelligence
              </span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            Agents that analyze data, monitor competitors, track market trends, and generate insights to inform your strategy.
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Market research and analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Competitive intelligence</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Report generation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Insight discovery</span>
            </div>
          </div>
        </button>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleNext}
          disabled={!agentCategory}
          className={`px-6 py-3 rounded-lg font-medium ${
            agentCategory
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue <ArrowRight className="w-5 h-5 ml-2 inline" />
        </button>
      </div>
    </div>
  );

  const renderAgentSelection = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Select {agentCategory === 'customer-facing' ? 'Customer-Facing' : 'Research'} Agent
        </h1>
        <p className="text-lg text-gray-600">Choose the specific agent type that fits your needs</p>
      </div>

      <div className="space-y-4">
        {availableAgents.map((agent) => {
          const IconComponent = agent.icon;
          const colorClasses = {
            blue: 'bg-blue-500',
            red: 'bg-red-500', 
            green: 'bg-green-500',
            yellow: 'bg-yellow-500',
            purple: 'bg-purple-500',
            indigo: 'bg-indigo-500',
            orange: 'bg-orange-500',
            teal: 'bg-teal-500'
          }[agent.color] || 'bg-gray-500';
          
          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`relative p-6 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md w-full ${
                selectedAgent === agent.id 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              {selectedAgent === agent.id && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses}`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-gray-900 text-lg mb-1">{agent.name}</h5>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-2">
                    {agent.type}
                  </span>
                  <p className="text-gray-600 text-sm">
                    {agent.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-lg font-medium bg-gray-300 text-gray-700 hover:bg-gray-400"
        >
          <ArrowLeft className="w-5 h-5 mr-2 inline" /> Back
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedAgent}
          className={`px-6 py-3 rounded-lg font-medium ${
            selectedAgent
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Configure Agent <ArrowRight className="w-5 h-5 ml-2 inline" />
        </button>
      </div>
    </div>
  );

  const renderConfiguration = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Configure Your Agent</h1>
        <p className="text-lg text-gray-600">Customize the behavior and settings</p>
      </div>

      {agentCategory === 'customer-facing' ? renderCustomerFacingConfig() : renderResearchConfig()}

      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-lg font-medium bg-gray-300 text-gray-700 hover:bg-gray-400"
        >
          <ArrowLeft className="w-5 h-5 mr-2 inline" /> Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700"
        >
          Review & Create <ArrowRight className="w-5 h-5 ml-2 inline" />
        </button>
      </div>
    </div>
  );

  const renderCustomerFacingConfig = () => (
    <div className="space-y-4">
      {/* AI Configuration Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h6 className="font-medium text-blue-900">AI-Powered Configuration</h6>
              <p className="text-sm text-blue-700 mt-1">
                Optimize your outreach strategy with AI recommendations
              </p>
            </div>
          </div>
          {!aiGenerated ? (
            <button
              onClick={() => {
                const agent = availableAgents.find(a => a.id === selectedAgent);
                if (!agent) return;
                
                let optimizedConfig = { ...agentConfig };
                
                if (agent.type === 'Renewal Specialist') {
                  optimizedConfig = {
                    ...optimizedConfig,
                    outreach_frequency: 'biweekly',
                    max_attempts: 4,
                    tone: 'professional',
                    message_style: 'personalized'
                  };
                } else if (agent.type === 'Health Specialist') {
                  optimizedConfig = {
                    ...optimizedConfig,
                    outreach_frequency: '3days',
                    max_attempts: 3,
                    tone: 'friendly',
                    message_style: 'detailed'
                  };
                } else if (agent.type === 'Onboarding Specialist') {
                  optimizedConfig = {
                    ...optimizedConfig,
                    outreach_frequency: 'daily',
                    max_attempts: 5,
                    tone: 'friendly',
                    message_style: 'detailed'
                  };
                } else if (agent.type === 'Growth Specialist') {
                  optimizedConfig = {
                    ...optimizedConfig,
                    outreach_frequency: 'biweekly',
                    max_attempts: 3,
                    tone: 'professional',
                    message_style: 'concise'
                  };
                }
                
                setAgentConfig(optimizedConfig);
                setAiGenerated(true);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>AI Optimize</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Configuration Optimized</span>
            </div>
          )}
        </div>
        
        {!aiGenerated && (
          <div className="mt-4">
            <div className="mb-3">
              <label className="block text-sm font-medium text-blue-800 mb-2">Outreach Goals (Optional)</label>
              <textarea
                value={researchPrompt}
                onChange={(e) => setResearchPrompt(e.target.value)}
                placeholder={`e.g., "Focus on accounts with low health scores and upcoming renewals" or "Prioritize quick wins with high-value prospects who haven't engaged recently"`}
                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/50"
                rows={3}
              />
            </div>
            <div className="text-xs text-blue-700">
              💡 Describe your outreach strategy for AI-optimized configuration
            </div>
          </div>
        )}
        
        {aiGenerated && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Want to adjust the optimization?</span>
              </div>
              <button
                onClick={() => {
                  setAiGenerated(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Reconfigure
              </button>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Update your outreach goals to re-optimize the configuration
            </p>
          </div>
        )}
      </div>

      {/* Basic Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Settings</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Outreach Frequency</label>
            <select
              value={agentConfig.outreach_frequency}
              onChange={(e) => setAgentConfig(prev => ({ ...prev, outreach_frequency: e.target.value as any }))}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="daily">Daily</option>
              <option value="3days">Every 3 Days</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Attempts</label>
            <select
              value={agentConfig.max_attempts}
              onChange={(e) => setAgentConfig(prev => ({ ...prev, max_attempts: parseInt(e.target.value) }))}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="3">3 attempts</option>
              <option value="5">5 attempts</option>
              <option value="7">7 attempts</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
            <select
              value={agentConfig.tone}
              onChange={(e) => setAgentConfig(prev => ({ ...prev, tone: e.target.value as any }))}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message Style</label>
            <select
              value={agentConfig.message_style}
              onChange={(e) => setAgentConfig(prev => ({ ...prev, message_style: e.target.value as any }))}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="concise">Concise</option>
              <option value="detailed">Detailed</option>
              <option value="personalized">Personalized</option>
            </select>
          </div>
        </div>

      </div>

      {/* Recipient List */}
      {showRecipientList && recipients.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Contact Recipients ({recipients.length})</h3>
              <p className="text-sm text-gray-600 mt-1">
                Auto-generated from selected accounts. Add manual contacts as needed.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAddRecipient(!showAddRecipient)}
                className="px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Manual</span>
              </button>
              <button
                onClick={() => setShowRecipientList(false)}
                className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1"
              >
                <ChevronUp className="w-4 h-4" />
                <span>Hide</span>
              </button>
            </div>
          </div>

          {showAddRecipient && (
            <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
              <h6 className="font-medium text-gray-900 mb-3">Add Manual Contact</h6>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newRecipient.firstName}
                  onChange={(e) => setNewRecipient({...newRecipient, firstName: e.target.value})}
                  placeholder="First Name"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <input
                  type="text"
                  value={newRecipient.lastName}
                  onChange={(e) => setNewRecipient({...newRecipient, lastName: e.target.value})}
                  placeholder="Last Name"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <input
                  type="email"
                  value={newRecipient.email}
                  onChange={(e) => setNewRecipient({...newRecipient, email: e.target.value})}
                  placeholder="Email Address"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <input
                  type="text"
                  value={newRecipient.title}
                  onChange={(e) => setNewRecipient({...newRecipient, title: e.target.value})}
                  placeholder="Job Title"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <select
                  value={newRecipient.role}
                  onChange={(e) => setNewRecipient({...newRecipient, role: e.target.value as 'Admin' | 'User'})}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
                <input
                  type="text"
                  value={newRecipient.accountName}
                  onChange={(e) => setNewRecipient({...newRecipient, accountName: e.target.value})}
                  placeholder="Account/Company Name"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <button
                  onClick={addManualRecipient}
                  disabled={!newRecipient.firstName || !newRecipient.lastName || !newRecipient.email}
                  className="px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Contact</span>
                </button>
                <button
                  onClick={() => setShowAddRecipient(false)}
                  className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Name</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Email</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Title</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Role</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Account</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Source</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipients.map((recipient) => (
                  <tr key={recipient.id} className="border-b border-gray-100">
                    <td className="py-2 px-3">
                      <div className="font-medium text-gray-900">{recipient.firstName} {recipient.lastName}</div>
                    </td>
                    <td className="py-2 px-3 text-gray-600">{recipient.email}</td>
                    <td className="py-2 px-3 text-gray-600">{recipient.title}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        recipient.role === 'Admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {recipient.role}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-600">{recipient.accountName}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        recipient.source === 'auto' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {recipient.source}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      {recipient.source === 'manual' && (
                        <button
                          onClick={() => removeRecipient(recipient.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Remove contact"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sample Email for Tone */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sample Email (Optional)
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Paste a sample email in your preferred tone and style. Our AI will replicate this tone across all generated templates.
          </p>
          <textarea
            value={exampleEmail}
            onChange={(e) => setExampleEmail(e.target.value)}
            placeholder="Subject: Following up on our conversation...

Hi [Name],

I wanted to follow up on our conversation about [topic]. Based on what you mentioned about [specific detail], I think our solution could really help with [specific benefit].

Would you be available for a quick 15-minute call next week to discuss this further?

Best regards,
[Your Name]"
            className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={8}
          />
        </div>
      </div>
    </div>
  );

  const renderResearchConfig = () => (
    <div className="space-y-6">
      {/* AI Research Assistant - Matching Competitor Flow */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Research Assistant</h3>
              <p className="text-sm text-gray-600">
                {showResearchConfig 
                  ? 'Configuration completed! Review and edit the settings below.' 
                  : 'Let AI analyze your research needs and auto-configure optimal settings'
                }
              </p>
            </div>
          </div>
          
          {!showResearchConfig && (
            <button
              onClick={() => {
                if (!researchPrompt.trim()) {
                  // If no prompt, use default configuration
                  const agentType = selectedAgent;
                  let defaultConfig = {};
                  
                  if (agentType === 'research-competitive-001') {
                    defaultConfig = {
                      purpose: 'pricing changes, feature releases, market positioning, competitive threats',
                      analysis_framework: 'Use competitive benchmarking, Use trend analysis, Use SWOT analysis',
                      escalation_rules: 'Alert for price changes >10%, Alert for new product launches, Alert for partnership announcements',
                      business_context: 'B2B SaaS, Growth stage, High-tech'
                    };
                  } else if (agentType === 'research-market-001') {
                    defaultConfig = {
                      purpose: 'industry trends, market growth, customer sentiment, regulatory changes',
                      analysis_framework: 'Use trend analysis, Use sentiment analysis, Use statistical comparison',
                      escalation_rules: 'Alert for market shifts >15%, Alert for regulatory updates, Alert for industry reports',
                      business_context: 'B2B SaaS, Enterprise focus, High-tech'
                    };
                  } else if (agentType === 'research-product-001') {
                    defaultConfig = {
                      purpose: 'usage patterns, feature adoption, user engagement, performance metrics',
                      analysis_framework: 'Use cohort analysis, Use A/B testing insights, Use pattern recognition',
                      escalation_rules: 'Alert for usage drops >10%, Alert for feature adoption <50%, Alert for user complaints',
                      business_context: 'B2B SaaS, Product-focused, High-tech'
                    };
                  } else {
                    defaultConfig = {
                      purpose: 'content performance, seo rankings, engagement metrics, conversion rates',
                      analysis_framework: 'Use content analysis, Use sentiment analysis, Use trend analysis',
                      escalation_rules: 'Alert for traffic drops >15%, Alert for engagement decline',
                      business_context: 'B2B SaaS, Content-focused, High-tech'
                    };
                  }
                  
                  setAgentConfig({
                    ...agentConfig,
                    ...defaultConfig
                  });
                  
                  setShowResearchConfig(true);
                  setAiGenerated(true);
                  return;
                }
                
                // Use custom prompt logic
                const agentType = selectedAgent;
                const userPrompt = researchPrompt.toLowerCase();
                let defaultConfig = {};
                
                // Base configuration by agent type with prompt customization
                if (agentType === 'research-competitive-001') {
                  let focusAreas = ['pricing changes', 'feature releases', 'market positioning'];
                  let analysisFramework = ['Use competitive benchmarking', 'Use trend analysis'];
                  let alertTriggers = ['Alert for price changes >10%', 'Alert for new product launches'];
                  let businessContext = ['B2B SaaS', 'Growth stage', 'High-tech'];
                  
                  // Customize based on user prompt
                  if (userPrompt.includes('pricing') || userPrompt.includes('price')) {
                    focusAreas.push('pricing strategy', 'discount campaigns');
                    alertTriggers.push('Alert for price changes >5%', 'Alert for promotional campaigns');
                  }
                  if (userPrompt.includes('feature') || userPrompt.includes('product')) {
                    focusAreas.push('product launches', 'feature updates', 'roadmap changes');
                    alertTriggers.push('Alert for feature updates', 'Alert for product announcements');
                  }
                  if (userPrompt.includes('roadmap') || userPrompt.includes('planning')) {
                    focusAreas.push('strategic announcements', 'partnership news');
                    analysisFramework.push('Use strategic analysis', 'Use roadmap correlation');
                  }
                  if (userPrompt.includes('enterprise') || userPrompt.includes('b2b')) {
                    businessContext = ['B2B SaaS', 'Enterprise focus', 'High-tech'];
                    focusAreas.push('enterprise features', 'integration announcements');
                  }
                  
                  defaultConfig = {
                    purpose: focusAreas.join(', '),
                    analysis_framework: analysisFramework.join(', '),
                    escalation_rules: alertTriggers.join(', '),
                    business_context: businessContext.join(', ')
                  };
                } else if (agentType === 'research-market-001') {
                  let focusAreas = ['industry trends', 'market growth', 'regulatory changes'];
                  let analysisFramework = ['Use trend analysis', 'Use sentiment analysis'];
                  let alertTriggers = ['Alert for market shifts >15%', 'Alert for regulatory updates'];
                  let businessContext = ['B2B SaaS', 'Growth stage', 'High-tech'];
                  
                  if (userPrompt.includes('regulation') || userPrompt.includes('compliance')) {
                    focusAreas.push('regulatory updates', 'compliance requirements', 'policy changes');
                    alertTriggers.push('Alert for policy changes', 'Alert for compliance requirements');
                    analysisFramework.push('Use regulatory analysis');
                  }
                  if (userPrompt.includes('sentiment') || userPrompt.includes('opinion')) {
                    focusAreas.push('customer sentiment', 'brand perception', 'market sentiment');
                    analysisFramework.push('Use sentiment analysis', 'Use social listening');
                  }
                  if (userPrompt.includes('ai') || userPrompt.includes('artificial intelligence')) {
                    focusAreas.push('ai trends', 'technology adoption', 'ai regulation');
                    businessContext.push('AI/ML focus');
                  }
                  
                  defaultConfig = {
                    purpose: focusAreas.join(', '),
                    analysis_framework: analysisFramework.join(', '),
                    escalation_rules: alertTriggers.join(', '),
                    business_context: businessContext.join(', ')
                  };
                } else if (agentType === 'research-product-001') {
                  let focusAreas = ['usage patterns', 'feature adoption', 'user engagement'];
                  let analysisFramework = ['Use cohort analysis', 'Use A/B testing insights'];
                  let alertTriggers = ['Alert for usage drops >10%', 'Alert for feature adoption <50%'];
                  
                  if (userPrompt.includes('churn') || userPrompt.includes('retention')) {
                    focusAreas.push('churn indicators', 'retention metrics', 'user satisfaction');
                    analysisFramework.push('Use churn prediction', 'Use retention analysis');
                    alertTriggers.push('Alert for churn rate increases', 'Alert for satisfaction drops');
                  }
                  if (userPrompt.includes('performance') || userPrompt.includes('speed')) {
                    focusAreas.push('performance metrics', 'load times', 'error rates');
                    alertTriggers.push('Alert for performance degradation');
                  }
                  
                  defaultConfig = {
                    purpose: focusAreas.join(', '),
                    analysis_framework: analysisFramework.join(', '),
                    escalation_rules: alertTriggers.join(', '),
                    business_context: 'B2B SaaS, Product-focused, High-tech'
                  };
                } else {
                  let focusAreas = ['content performance', 'seo rankings', 'engagement metrics'];
                  let analysisFramework = ['Use content analysis', 'Use SEO analysis'];
                  
                  if (userPrompt.includes('seo') || userPrompt.includes('search')) {
                    focusAreas.push('keyword rankings', 'backlink changes', 'search visibility');
                    analysisFramework.push('Use SEO tracking', 'Use keyword analysis');
                  }
                  
                  defaultConfig = {
                    purpose: focusAreas.join(', '),
                    analysis_framework: analysisFramework.join(', '),
                    escalation_rules: 'Alert for traffic drops >15%, Alert for engagement decline',
                    business_context: 'B2B SaaS, Content-focused, High-tech'
                  };
                }
                
                setAgentConfig({
                  ...agentConfig,
                  ...defaultConfig
                });
                
                setShowResearchConfig(true);
                setAiGenerated(true);
              }}
              className="calendly-btn-primary flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>AI Research</span>
            </button>
          )}
          
          {showResearchConfig && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Configuration Complete</span>
            </div>
          )}
        </div>
        
        {!showResearchConfig && (
          <div className="mt-4">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Research Focus (Optional)</label>
              <textarea
                value={researchPrompt}
                onChange={(e) => setResearchPrompt(e.target.value)}
                placeholder={`e.g., "Monitor our top 3 competitors for pricing changes and new feature launches that could impact our Q2 roadmap" or "Track industry sentiment around AI regulation that might affect our compliance strategy"`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                rows={3}
              />
            </div>
            <div className="text-xs text-gray-500">
              💡 Describe specific goals to get customized configuration, or leave blank for defaults
            </div>
          </div>
        )}
        
        {/* Reconfigure Option */}
        {showResearchConfig && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Want to adjust the configuration?</span>
              </div>
              <button
                onClick={() => {
                  setShowResearchConfig(false);
                  setAiGenerated(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Reconfigure
              </button>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Update your research focus to regenerate the configuration
            </p>
          </div>
        )}
      </div>

      {/* Competitor Selection for Research Agents */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h6 className="font-medium text-gray-900">Target Competitors</h6>
            <p className="text-sm text-gray-600 mt-1">
              Select specific competitors to monitor (optional for focused research)
            </p>
          </div>
          <button
            onClick={() => setShowCompetitorSelection(!showCompetitorSelection)}
            className="px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors flex items-center space-x-1"
          >
            {showCompetitorSelection ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Hide</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Select Competitors</span>
              </>
            )}
          </button>
        </div>
        
        {selectedCompetitors.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {selectedCompetitors.map((competitorId) => {
                const competitor = mockCompetitors.find(c => c.id === competitorId);
                if (!competitor) return null;
                return (
                  <div key={competitorId} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                    <span>{competitor.name}</span>
                    <button
                      onClick={() => setSelectedCompetitors(prev => prev.filter(id => id !== competitorId))}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {showCompetitorSelection && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={competitorSearchQuery}
                  onChange={(e) => setCompetitorSearchQuery(e.target.value)}
                  placeholder="Search competitors by name, category, or market cap..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
            
            {/* Competitor Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {filteredCompetitors.length > 0 ? (
                filteredCompetitors.map((competitor) => (
                <button
                  key={competitor.id}
                  onClick={() => {
                    if (selectedCompetitors.includes(competitor.id)) {
                      setSelectedCompetitors(prev => prev.filter(id => id !== competitor.id));
                    } else {
                      setSelectedCompetitors(prev => [...prev, competitor.id]);
                    }
                  }}
                  className={`p-3 border rounded-lg text-sm text-left transition-all duration-200 ${
                    selectedCompetitors.includes(competitor.id)
                      ? 'border-purple-500 bg-purple-50 text-purple-900'
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="font-medium">{competitor.name}</div>
                  <div className="text-xs opacity-75">{competitor.category} • {competitor.marketCap}</div>
                </button>
              ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <div className="text-sm">No competitors found matching "{competitorSearchQuery}"</div>
                  <button 
                    onClick={() => setCompetitorSearchQuery('')}
                    className="text-purple-600 hover:text-purple-700 text-sm mt-1"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Progressive Configuration Display */}
      {showResearchConfig && (
        <div className="space-y-6">
          {/* 1. Research Focus Areas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Research Focus Areas</label>
              <button
                onClick={() => setShowFocusLibrary(!showFocusLibrary)}
                className="text-sm text-purple-600 hover:text-purple-700 transition-colors flex items-center space-x-1"
              >
                {showFocusLibrary ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>Hide library</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>Browse library</span>
                  </>
                )}
              </button>
            </div>
            
            {agentConfig.purpose && (
              <div className="mb-3">
                {renderCompactPills(
                  agentConfig.purpose.split(', ').filter(item => item.trim()),
                  (index) => {
                    const items = agentConfig.purpose.split(', ').filter(item => item.trim());
                    items.splice(index, 1);
                    setAgentConfig({...agentConfig, purpose: items.join(', ')});
                  },
                  showAllFocus,
                  setShowAllFocus,
                  'bg-purple-100 text-purple-800 border-purple-300',
                  4
                )}
              </div>
            )}
            
            {/* Expandable Focus Library */}
            {showFocusLibrary && (
              <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(selectedAgent === 'research-competitive-001' ? 
                    [
                      'pricing changes', 'feature releases', 'market positioning', 'new competitors',
                      'product launches', 'partnership announcements', 'funding news', 'executive changes',
                      'marketing campaigns', 'customer reviews', 'website updates', 'social media activity',
                      'press releases', 'job postings', 'patent filings', 'regulatory filings'
                    ] :
                    selectedAgent === 'research-market-001' ?
                    [
                      'industry trends', 'market growth', 'customer sentiment', 'regulatory changes',
                      'technology shifts', 'investment patterns', 'economic indicators', 'policy updates',
                      'analyst reports', 'research publications', 'conference insights', 'survey data',
                      'demographic changes', 'consumer behavior', 'adoption rates', 'market saturation'
                    ] :
                    selectedAgent === 'research-product-001' ?
                    [
                      'usage patterns', 'feature adoption', 'user engagement', 'performance metrics',
                      'bug reports', 'user satisfaction', 'churn indicators', 'support tickets',
                      'app store reviews', 'user feedback', 'beta testing results', 'a/b test outcomes',
                      'integration usage', 'api consumption', 'mobile vs desktop', 'geographic usage'
                    ] :
                    [
                      'content performance', 'seo rankings', 'engagement metrics', 'conversion rates',
                      'social shares', 'brand mentions', 'viral content', 'trending topics',
                      'backlink changes', 'keyword rankings', 'competitor content', 'industry news',
                      'influencer mentions', 'pr coverage', 'event coverage', 'thought leadership'
                    ]
                  ).map((focus) => {
                    const selectedFocus = agentConfig.purpose?.split(', ') || [];
                    const isSelected = selectedFocus.includes(focus);
                    
                    return (
                      <button
                        key={focus}
                        onClick={() => {
                          if (isSelected) {
                            const filteredFocus = selectedFocus.filter(f => f !== focus);
                            setAgentConfig({
                              ...agentConfig,
                              purpose: filteredFocus.join(', ')
                            });
                          } else {
                            const newFocus = [...selectedFocus, focus];
                            setAgentConfig({
                              ...agentConfig,
                              purpose: newFocus.join(', ')
                            });
                          }
                        }}
                        className={`p-2 text-sm font-medium rounded-lg border transition-colors text-left ${
                          isSelected
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {focus}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. Analysis Approach */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Analysis Approach</label>
              <button
                onClick={() => setShowAnalysisLibrary(!showAnalysisLibrary)}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1"
              >
                {showAnalysisLibrary ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>Hide library</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>Browse library</span>
                  </>
                )}
              </button>
            </div>
            
            {agentConfig.analysis_framework && (
              <div className="mb-3">
                {renderCompactPills(
                  agentConfig.analysis_framework.split(', ').filter(item => item.trim()),
                  (index) => {
                    const items = agentConfig.analysis_framework.split(', ').filter(item => item.trim());
                    items.splice(index, 1);
                    setAgentConfig({...agentConfig, analysis_framework: items.join(', ')});
                  },
                  showAllAnalysis,
                  setShowAllAnalysis,
                  'bg-blue-100 text-blue-800 border-blue-300',
                  4
                )}
              </div>
            )}
            
            {/* Expandable Analysis Library */}
            {showAnalysisLibrary && (
              <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    // Core Analysis Methods
                    'Use SWOT analysis', 'Use trend analysis', 'Use competitive benchmarking', 'Use sentiment analysis',
                    'Use statistical comparison', 'Use pattern recognition', 'Use cohort analysis', 'Use A/B testing insights',
                    // Advanced Techniques
                    'Use regression analysis', 'Use time series analysis', 'Use correlation analysis', 'Use variance analysis',
                    'Use market basket analysis', 'Use churn prediction', 'Use lifetime value analysis', 'Use price elasticity',
                    // Qualitative Methods
                    'Use thematic analysis', 'Use content analysis', 'Use discourse analysis', 'Use ethnographic research',
                    'Use survey analysis', 'Use interview analysis', 'Use focus group insights', 'Use user journey mapping'
                  ].map((approach) => {
                    const selectedApproaches = agentConfig.analysis_framework?.split(', ') || [];
                    const isSelected = selectedApproaches.includes(approach);
                    
                    return (
                      <button
                        key={approach}
                        onClick={() => {
                          if (isSelected) {
                            const filteredApproaches = selectedApproaches.filter(a => a !== approach);
                            setAgentConfig({
                              ...agentConfig,
                              analysis_framework: filteredApproaches.join(', ')
                            });
                          } else {
                            const newApproaches = [...selectedApproaches, approach];
                            setAgentConfig({
                              ...agentConfig,
                              analysis_framework: newApproaches.join(', ')
                            });
                          }
                        }}
                        className={`p-2 text-sm font-medium rounded-lg border transition-colors text-left ${
                          isSelected
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {approach}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Alert & Escalation Rules */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Alert & Escalation Rules</label>
              <button
                onClick={() => setShowEscalationLibrary(!showEscalationLibrary)}
                className="text-sm text-orange-600 hover:text-orange-700 transition-colors flex items-center space-x-1"
              >
                {showEscalationLibrary ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>Hide library</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>Browse library</span>
                  </>
                )}
              </button>
            </div>
            
            {agentConfig.escalation_rules && (
              <div className="mb-3">
                {renderCompactPills(
                  agentConfig.escalation_rules.split(', ').filter(item => item.trim()),
                  (index) => {
                    const items = agentConfig.escalation_rules.split(', ').filter(item => item.trim());
                    items.splice(index, 1);
                    setAgentConfig({...agentConfig, escalation_rules: items.join(', ')});
                  },
                  showAllEscalation,
                  setShowAllEscalation,
                  'bg-orange-100 text-orange-800 border-orange-300',
                  4
                )}
              </div>
            )}
            
            {/* Expandable Escalation Library */}
            {showEscalationLibrary && (
              <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    // Threshold-based alerts
                    'Alert for price changes >10%', 'Alert for price changes >5%', 'Alert for price changes >15%',
                    'Alert for market shifts >15%', 'Alert for usage drops >10%', 'Alert for engagement decline >20%',
                    'Alert for feature adoption <50%', 'Alert for churn rate increases >5%', 'Alert for satisfaction drops >15%',
                    // Event-based alerts
                    'Alert for new product launches', 'Alert for feature updates', 'Alert for partnership announcements',
                    'Alert for regulatory updates', 'Alert for policy changes', 'Alert for executive changes',
                    'Alert for funding announcements', 'Alert for acquisition news', 'Alert for major press releases',
                    // Performance alerts
                    'Alert for performance degradation', 'Alert for traffic drops >15%', 'Alert for conversion drops',
                    'Alert for user complaints spike', 'Alert for support ticket increase', 'Alert for negative reviews'
                  ].map((rule) => {
                    const selectedRules = agentConfig.escalation_rules?.split(', ') || [];
                    const isSelected = selectedRules.includes(rule);
                    
                    return (
                      <button
                        key={rule}
                        onClick={() => {
                          if (isSelected) {
                            const filteredRules = selectedRules.filter(r => r !== rule);
                            setAgentConfig({
                              ...agentConfig,
                              escalation_rules: filteredRules.join(', ')
                            });
                          } else {
                            const newRules = [...selectedRules, rule];
                            setAgentConfig({
                              ...agentConfig,
                              escalation_rules: newRules.join(', ')
                            });
                          }
                        }}
                        className={`p-2 text-sm font-medium rounded-lg border transition-colors text-left ${
                          isSelected
                            ? 'bg-orange-100 text-orange-800 border-orange-300'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {rule}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4. Business Context */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Context</label>
            <textarea
              value={agentConfig.business_context}
              onChange={(e) => setAgentConfig({...agentConfig, business_context: e.target.value})}
              placeholder="B2B SaaS, Growth stage, High-tech"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              rows={2}
            />
          </div>

          {/* Continue Button */}
          {selectedAgent && agentConfig.purpose && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setStepsCompleted(prev => ({...prev, configuration: true}));
                  setStepsCollapsed(prev => ({...prev, competitorSelection: false}));
                  handleNextStep('competitors');
                }}
                className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>Continue to Competitor Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 3: Select Competitors */}
          {selectedAgent && stepsCompleted.configuration && (
            <div className="calendly-card-static" data-section="competitors">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => setStepsCollapsed(prev => ({...prev, competitorSelection: !prev.competitorSelection}))}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <h2 className="calendly-h3">Step 3: Select Competitors</h2>
                    {stepsCollapsed.competitorSelection && selectedCompetitors.length > 0 && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {selectedCompetitors.length} competitors
                      </span>
                    )}
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${stepsCollapsed.competitorSelection ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {!stepsCollapsed.competitorSelection && (
                <div className="mt-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Select competitors you want your research agent to monitor and analyze.
                    </p>
                  </div>

                  {selectedCompetitors.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {selectedCompetitors.map((competitorId) => {
                          const competitor = mockCompetitors.find(c => c.id === competitorId);
                          if (!competitor) return null;
                          return (
                            <div key={competitorId} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                              <span>{competitor.name}</span>
                              <button
                                onClick={() => setSelectedCompetitors(prev => prev.filter(id => id !== competitorId))}
                                className="text-purple-600 hover:text-purple-800"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="mb-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={competitorSearchQuery}
                          onChange={(e) => setCompetitorSearchQuery(e.target.value)}
                          placeholder="Search competitors..."
                          className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                      {filteredCompetitors.map((competitor) => (
                        <button
                          key={competitor.id}
                          onClick={() => {
                            if (selectedCompetitors.includes(competitor.id)) {
                              setSelectedCompetitors(prev => prev.filter(id => id !== competitor.id));
                            } else {
                              setSelectedCompetitors(prev => [...prev, competitor.id]);
                            }
                          }}
                          className={`relative p-3 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-sm ${
                            selectedCompetitors.includes(competitor.id)
                              ? 'border-purple-500 bg-purple-50 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                          }`}
                        >
                          {selectedCompetitors.includes(competitor.id) && (
                            <div className="absolute top-2 right-2">
                              <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm mb-1">{competitor.name}</h5>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-1">
                              {competitor.category}
                            </span>
                            <p className="text-xs text-gray-500">
                              {competitor.marketCap} cap
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => {
                        setStepsCompleted(prev => ({...prev, competitorSelection: true}));
                        setShowCustomerSelection(true);
                        setStepsCollapsed(prev => ({...prev, customerSelection: false}));
                        handleNextStep('customers');
                      }}
                      className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <span>Continue to Customer Selection</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Customer Selection */}
          {selectedAgent && stepsCompleted.competitorSelection && showCustomerSelection && (
            <div className="calendly-card-static" data-section="customers">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => setStepsCollapsed(prev => ({...prev, customerSelection: !prev.customerSelection}))}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <h2 className="calendly-h3">Step 4: Select Customers</h2>
                    {stepsCollapsed.customerSelection && selectedCustomers.length > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {selectedCustomers.length} customers
                      </span>
                    )}
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${stepsCollapsed.customerSelection ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {!stepsCollapsed.customerSelection && (
                <div className="mt-6">
                  {renderCustomerSelectionSection()}
                  
                  {/* Recipients Management */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Recipients</h3>
                      <button
                        onClick={() => setShowAddRecipient(true)}
                        className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Manual Contact</span>
                      </button>
                    </div>
                    
                    {/* Add Manual Recipient Form */}
                    {showAddRecipient && (
                      <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Add Manual Contact</h4>
                          <button
                            onClick={() => {
                              setShowAddRecipient(false);
                              setNewRecipient({
                                firstName: '',
                                lastName: '',
                                email: '',
                                title: '',
                                company: '',
                                customerId: ''
                              });
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 mb-3">
                          <input
                            type="text"
                            value={newRecipient.firstName}
                            onChange={(e) => setNewRecipient({...newRecipient, firstName: e.target.value})}
                            placeholder="First Name *"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          <input
                            type="email"
                            value={newRecipient.email}
                            onChange={(e) => setNewRecipient({...newRecipient, email: e.target.value})}
                            placeholder="Email Address *"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          <input
                            type="text"
                            value={newRecipient.company}
                            onChange={(e) => setNewRecipient({...newRecipient, company: e.target.value})}
                            placeholder="Company Name (optional)"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setShowAddRecipient(false);
                              setNewRecipient({
                                firstName: '',
                                lastName: '',
                                email: '',
                                title: '',
                                company: '',
                                customerId: ''
                              });
                            }}
                            className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              if (newRecipient.firstName && newRecipient.email) {
                                const recipient = {
                                  id: Date.now().toString(),
                                  ...newRecipient,
                                  lastName: newRecipient.lastName || '',
                                  customerId: selectedCustomers[0] || '',
                                  source: 'manual' as const,
                                  enrolled: true
                                };
                                setRecipients(prev => [...prev, recipient]);
                                setNewRecipient({
                                  firstName: '',
                                  lastName: '',
                                  email: '',
                                  title: '',
                                  company: '',
                                  customerId: ''
                                });
                                setShowAddRecipient(false);
                              }
                            }}
                            disabled={!newRecipient.firstName || !newRecipient.email}
                            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Add Contact
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Recipients Table */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-max w-full divide-y divide-gray-200" style={{minWidth: '800px'}}>
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                                Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                                Email
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                                Company
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                Enrollment
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {(() => {
                              // Collect all recipients from selected customers
                              const allRecipients = [];
                              
                              // HubSpot contacts from selected customers
                              selectedCustomers.forEach(customerId => {
                                const customer = mockCustomers.find(c => c.id === customerId);
                                if (customer && customer.contacts) {
                                  customer.contacts.forEach((contact, index) => {
                                    allRecipients.push({
                                      id: `hubspot-${customerId}-${index}`,
                                      firstName: contact.firstName,
                                      lastName: contact.lastName,
                                      email: contact.email,
                                      title: contact.title || '',
                                      company: customer.name,
                                      customerId: customerId,
                                      source: 'hubspot' as const,
                                      enrolled: true
                                    });
                                  });
                                }
                              });
                              
                              // Manual recipients
                              recipients.forEach(recipient => {
                                const customer = mockCustomers.find(c => c.id === recipient.customerId);
                                allRecipients.push({
                                  ...recipient,
                                  company: customer?.name || recipient.company || 'Unknown'
                                });
                              });
                              
                              if (allRecipients.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                      <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                      <p className="text-lg font-medium text-gray-900 mb-2">No recipients yet</p>
                                      <p className="text-sm">
                                        {selectedCustomers.length === 0 
                                          ? 'Select customers above to see their contacts, or add manual contacts.'
                                          : 'No contacts found for selected customers. Add manual contacts to get started.'
                                        }
                                      </p>
                                    </td>
                                  </tr>
                                );
                              }
                              
                              return allRecipients.map((recipient) => {
                                const isEnrolled = recipient.source === 'hubspot' 
                                  ? hubspotEnrollment[recipient.id] !== false 
                                  : recipient.enrolled !== false;
                                
                                return (
                                  <tr key={recipient.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap w-48">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8">
                                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                            recipient.source === 'hubspot' ? 'bg-orange-100' : 'bg-blue-100'
                                          }`}>
                                            <User className={`h-4 w-4 ${
                                              recipient.source === 'hubspot' ? 'text-orange-600' : 'text-blue-600'
                                            }`} />
                                          </div>
                                        </div>
                                        <div className="ml-3">
                                          <div className="text-sm font-medium text-gray-900">
                                            {recipient.firstName} {recipient.lastName || ''}
                                          </div>
                                          {recipient.title && (
                                            <div className="text-xs text-gray-400">{recipient.title}</div>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap w-64">
                                      <div className="text-sm text-gray-900">{recipient.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap w-48">
                                      <div className="text-sm text-gray-900">
                                        {recipient.company || 'No company'}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap w-32">
                                      <label className="flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={isEnrolled}
                                          onChange={(e) => {
                                            if (recipient.source === 'manual') {
                                              setRecipients(prev => prev.map(r => 
                                                r.id === recipient.id 
                                                  ? { ...r, enrolled: e.target.checked }
                                                  : r
                                              ));
                                            } else if (recipient.source === 'hubspot') {
                                              setHubspotEnrollment(prev => ({
                                                ...prev,
                                                [recipient.id]: e.target.checked
                                              }));
                                            }
                                          }}
                                          className="sr-only"
                                        />
                                        <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                          isEnrolled ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}>
                                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                            isEnrolled ? 'translate-x-5' : 'translate-x-1'
                                          }`} />
                                        </div>
                                      </label>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center w-20">
                                      {recipient.source === 'manual' && (
                                        <button
                                          onClick={() => setRecipients(prev => prev.filter(r => r.id !== recipient.id))}
                                          className="text-red-600 hover:text-red-900 p-1"
                                          title="Remove contact"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  
                  {/* Complete Setup Button */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleCompleteSetup}
                      disabled={!selectedAgent || !agentConfig.purpose}
                      className="px-6 py-3 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <span>Complete Setup</span>
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderConfirmation = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Review & Confirm</h1>
        <p className="text-lg text-gray-600">Review your agent configuration before creating</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Summary</h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-600">Category:</span> <span className="font-medium capitalize">{agentCategory}</span></div>
              <div><span className="text-gray-600">Type:</span> <span className="font-medium">{availableAgents.find(a => a.id === selectedAgent)?.name}</span></div>
            </div>
          </div>

          {agentCategory === 'customer-facing' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Target Accounts</h4>
              <div className="text-sm text-gray-600">
                {selectedAccounts.length} accounts selected
              </div>
            </div>
          )}
        </div>

        {agentCategory === 'customer-facing' && selectedAccounts.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Estimated Results</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Estimated Reach:</span>
                <span className="font-medium text-blue-600 ml-1">{selectedAccounts.length * agentConfig.max_attempts} contacts</span>
              </div>
              <div>
                <span className="text-gray-600">Timeline:</span>
                <span className="font-medium ml-1">{Math.ceil(agentConfig.max_attempts * (String(agentConfig.outreach_frequency) === 'daily' ? 1 : String(agentConfig.outreach_frequency) === '3days' ? 3 : 7))} days</span>
              </div>
              <div>
                <span className="text-gray-600">Success Rate:</span>
                <span className="font-medium text-green-600 ml-1">~85-92%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-lg font-medium bg-gray-300 text-gray-700 hover:bg-gray-400"
        >
          <ArrowLeft className="w-5 h-5 mr-2 inline" /> Back
        </button>
        <button
          onClick={handleCreateAgent}
          className="px-6 py-3 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700"
        >
          Create Agent <CheckCircle className="w-5 h-5 ml-2 inline" />
        </button>
      </div>
    </div>
  );

  const renderCombinedResearchFlow = () => {
    return <div>Research Flow Placeholder</div>;
  };
  
  const renderCombinedResearchFlowOriginal = () => {
    const selectedAgentDetails = availableAgents.find(a => a.id === selectedAgent);

    const handleNextStep = (nextSection: string) => {
      setTimeout(() => {
        const section = document.querySelector(`[data-section="${nextSection}"]`);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create Research Agent
          </h1>
          <p className="text-lg text-gray-600">Select and configure your research agent</p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Agent Selection */}
          <div className="calendly-card-static">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => setStepsCollapsed(prev => ({...prev, agentSelection: !prev.agentSelection}))}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <h2 className="calendly-h3">Step 1: Select Agent Type</h2>
                  {selectedAgentDetails && stepsCollapsed.agentSelection && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {selectedAgentDetails.name}
                    </span>
                  )}
                </div>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform ${stepsCollapsed.agentSelection ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {!stepsCollapsed.agentSelection && (
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableAgents.map((agent) => {
                    const IconComponent = agent.icon;
                    const colorClasses = {
                      blue: 'bg-blue-500',
                      red: 'bg-red-500', 
                      green: 'bg-green-500',
                      yellow: 'bg-yellow-500',
                      purple: 'bg-purple-500',
                      indigo: 'bg-indigo-500',
                      orange: 'bg-orange-500',
                      teal: 'bg-teal-500'
                    }[agent.color] || 'bg-gray-500';
                    
                    return (
                      <button
                        key={agent.id}
                        onClick={() => setSelectedAgent(agent.id)}
                        className={`relative p-6 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md ${
                          selectedAgent === agent.id 
                            ? 'border-blue-500 bg-blue-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {selectedAgent === agent.id && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses}`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900 text-lg mb-1">{agent.name}</h5>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-2">
                              {agent.type}
                            </span>
                            <p className="text-gray-600 text-sm">
                              {agent.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Continue Button */}
            {selectedAgent && !stepsCollapsed.agentSelection && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setStepsCollapsed(prev => ({...prev, configuration: false}));
                    handleNextStep('configuration');
                  }}
                  className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
                >
                  <span>Continue to Configuration</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Configuration */}
          {selectedAgent && (
            <div className="calendly-card-static">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => setStepsCollapsed(prev => ({...prev, configuration: !prev.configuration}))}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <h2 className="calendly-h3">Step 2: Configure Agent</h2>
                    {agentConfig.purpose && stepsCollapsed.configuration && (
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {agentConfig.purpose.split(',').length} focus areas
                        </span>
                        {showResearchConfig && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            AI Configured
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${stepsCollapsed.configuration ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {!stepsCollapsed.configuration && (
                <div className="mt-6">
                  {renderResearchConfig()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCustomerSelectionSection = () => (
    <div>
      {selectedCustomers.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {selectedCustomers.map((customerId) => {
              const customer = mockCustomers.find(c => c.id === customerId);
              if (!customer) return null;
              return (
                <div key={customerId} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                  <span>{customer.name}</span>
                  <button
                    onClick={() => setSelectedCustomers(prev => prev.filter(id => id !== customerId))}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={customerSearchQuery}
              onChange={(e) => setCustomerSearchQuery(e.target.value)}
              placeholder="Search customers by name, tier, or status..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
            <button
              key={customer.id}
              onClick={() => {
                if (selectedCustomers.includes(customer.id)) {
                  setSelectedCustomers(prev => prev.filter(id => id !== customer.id));
                } else {
                  setSelectedCustomers(prev => [...prev, customer.id]);
                }
              }}
              className={`p-3 border rounded-lg text-sm text-left transition-all duration-200 ${
                selectedCustomers.includes(customer.id)
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="font-medium">{customer.name}</div>
              <div className="text-xs opacity-75">{customer.tier} • {customer.status}</div>
            </button>
          ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              <div className="text-sm">No customers found matching "{customerSearchQuery}"</div>
              <button 
                onClick={() => setCustomerSearchQuery('')}
                className="text-blue-600 hover:text-blue-700 text-sm mt-1"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );


  const renderCombinedCustomerFacingFlow = () => {
    const selectedAgentDetails = availableAgents.find(a => a.id === selectedAgent);

    const handleNextStep = (nextSection: string) => {
      setTimeout(() => {
        const section = document.querySelector(`[data-section="${nextSection}"]`);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create Customer-Facing Agent
          </h1>
          <p className="text-lg text-gray-600">Select and configure your customer-facing agent</p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Agent Selection */}
          <div className="calendly-card-static">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => setStepsCollapsed(prev => ({...prev, agentSelection: !prev.agentSelection}))}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <h2 className="calendly-h3">Step 1: Select Agent Type</h2>
                  {selectedAgentDetails && stepsCollapsed.agentSelection && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {selectedAgentDetails.name}
                    </span>
                  )}
                </div>
              </div>
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform ${stepsCollapsed.agentSelection ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {!stepsCollapsed.agentSelection && (
              <div className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableAgents.map((agent) => {
                    const IconComponent = agent.icon;
                    const colorClasses = {
                      blue: 'bg-blue-500',
                      red: 'bg-red-500', 
                      green: 'bg-green-500',
                      yellow: 'bg-yellow-500',
                      purple: 'bg-purple-500',
                      indigo: 'bg-indigo-500',
                      orange: 'bg-orange-500',
                      teal: 'bg-teal-500'
                    }[agent.color] || 'bg-gray-500';
                    
                    return (
                      <button
                        key={agent.id}
                        onClick={() => setSelectedAgent(agent.id)}
                        className={`relative p-6 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md ${
                          selectedAgent === agent.id 
                            ? 'border-blue-500 bg-blue-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {selectedAgent === agent.id && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                        
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses}`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900 text-lg mb-1">{agent.name}</h5>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-2">
                              {agent.type}
                            </span>
                            <p className="text-gray-600 text-sm">
                              {agent.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Continue Button */}
            {selectedAgent && !stepsCollapsed.agentSelection && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setStepsCompleted(prev => ({...prev, agentSelection: true}));
                    setStepsCollapsed(prev => ({...prev, configuration: false}));
                    handleNextStep('configuration');
                  }}
                  className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
                >
                  <span>Continue to Configuration</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Configuration */}
          {selectedAgent && stepsCompleted.agentSelection && (
            <div className="calendly-card-static" data-section="configuration">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => setStepsCollapsed(prev => ({...prev, configuration: !prev.configuration}))}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <h2 className="calendly-h3">Step 2: Configure Agent</h2>
                    {stepsCollapsed.configuration && (
                      <div className="flex items-center space-x-2">
                        {aiGenerated && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            AI Configured
                          </span>
                        )}
                        {agentConfig.outreach_frequency && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {agentConfig.outreach_frequency} frequency
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${stepsCollapsed.configuration ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {!stepsCollapsed.configuration && (
                <div className="mt-6">
                  {renderCustomerFacingConfig()}
                  
                  {/* Generate Emails AI Button */}
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => {
                        // Generate templates first
                        generateEmailTemplates();
                        
                        // Show toast notification
                        setShowToast(true);
                        setTimeout(() => setShowToast(false), 3000);
                        
                        // Then advance to the next step with templates visible
                        setTimeout(() => {
                          setStepsCompleted(prev => ({...prev, configuration: true}));
                          setStepsCollapsed(prev => ({...prev, generateTemplates: false}));
                          handleNextStep('generateTemplates');
                        }, 500);
                      }}
                      className="px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
                    >
                      {templatesGenerated && configChanged ? (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          <span>Regenerate Email Templates</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4" />
                          <span>Generate Email Templates with AI</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Generate Email Templates */}
          {selectedAgent && stepsCompleted.configuration && (
            <div className="calendly-card-static" data-section="generateTemplates">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => setStepsCollapsed(prev => ({...prev, generateTemplates: !prev.generateTemplates}))}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <h2 className="calendly-h3">Step 3: Generate Email Templates</h2>
                    {stepsCollapsed.generateTemplates && Object.values(emailTemplates).some(t => t.trim()) && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        Templates Generated
                      </span>
                    )}
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${stepsCollapsed.generateTemplates ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {!stepsCollapsed.generateTemplates && (
                <div className="mt-6">
                  {/* Email Templates Tabbed Display */}
                  {Object.values(emailTemplates).some(template => template.trim()) && (
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                      {/* Tab Navigation */}
                      <div className="border-b border-gray-200 bg-gray-50">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                          {Object.entries(emailTemplates).map(([key, template]) => {
                            if (!template.trim()) return null;
                            
                            const templateNames = {
                              initial_outreach: 'Initial Outreach',
                              follow_up_1: 'Follow-up #1',
                              follow_up_2: 'Follow-up #2', 
                              meeting_request: 'Meeting Request',
                              final_attempt: 'Final Attempt'
                            };

                            return (
                              <button
                                key={key}
                                onClick={() => setSelectedEmailTab(key)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                  selectedEmailTab === key
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                              >
                                {templateNames[key as keyof typeof templateNames]}
                              </button>
                            );
                          })}
                        </nav>
                      </div>

                      {/* Tab Content */}
                      <div className="p-6">
                        {Object.entries(emailTemplates).map(([key, template]) => {
                          if (!template.trim() || selectedEmailTab !== key) return null;
                          
                          const subject = emailSubjects[key as keyof typeof emailSubjects];

                          return (
                            <div key={key} className="space-y-6">
                              {/* Header with Rewrite Button */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-xl font-semibold text-gray-900">Email Preview</h3>
                                  <p className="text-sm text-gray-500 mt-1">Click to edit subject line and body</p>
                                </div>
                                <button
                                  onClick={() => rewriteTemplate(key)}
                                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-2"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                  <span>Rewrite</span>
                                </button>
                              </div>
                              
                              {/* Email Preview */}
                              <div className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Subject Line */}
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium text-gray-700 min-w-0">Subject:</span>
                                    {editingSubject === key ? (
                                      <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setEmailSubjects(prev => ({...prev, [key]: e.target.value}))}
                                        onBlur={() => setEditingSubject(null)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') setEditingSubject(null);
                                        }}
                                        className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                      />
                                    ) : (
                                      <button
                                        onClick={() => setEditingSubject(key)}
                                        className="flex-1 text-left text-sm text-gray-900 hover:text-blue-600 transition-colors"
                                      >
                                        {subject || 'Click to add subject'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Email Body */}
                                <div className="p-4">
                                  {editingBody === key ? (
                                    <textarea
                                      value={template}
                                      onChange={(e) => setEmailTemplates(prev => ({...prev, [key]: e.target.value}))}
                                      onBlur={() => setEditingBody(null)}
                                      className="w-full h-64 p-3 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                      autoFocus
                                    />
                                  ) : (
                                    <button
                                      onClick={() => setEditingBody(key)}
                                      className="w-full text-left text-sm text-gray-700 whitespace-pre-wrap leading-relaxed hover:bg-gray-50 p-3 rounded transition-colors"
                                    >
                                      {template}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Continue Button */}
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => {
                        setStepsCompleted(prev => ({...prev, generateTemplates: true}));
                        setShowCustomerSelection(true);
                        setStepsCollapsed(prev => ({...prev, customerSelection: false}));
                        handleNextStep('customers');
                      }}
                      className="px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <span>Continue to Customer Selection</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 'category':
        return renderCategorySelection();
      case 'select':
        return agentCategory === 'research' ? renderCombinedResearchFlow() : renderCombinedCustomerFacingFlow();
      case 'configure':
        return (agentCategory === 'research' || agentCategory === 'customer-facing') ? null : renderConfiguration();
      case 'confirm':
        return renderConfirmation();
      default:
        return renderCategorySelection();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">
              {stepsCompleted.complete 
                ? 'Agent created successfully! Redirecting...' 
                : 'Email templates generated successfully!'
              }
            </span>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.location.href = entryPoint === 'customers' ? '/customers' : '/agents'}
              className="p-2 rounded-lg transition-colors text-gray-400 hover:text-gray-600 hover:bg-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create AI Agent</h1>
              <p className="text-gray-600">
                {selectedAccounts.length > 0 
                  ? `Configure an AI agent for ${selectedAccounts.length} selected account${selectedAccounts.length !== 1 ? 's' : ''}`
                  : 'Create a new AI agent for your team'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {selectedAccounts.length === 0 && (
              <>
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getStepColor('category')}`}>
                    1
                  </div>
                  <span className="text-sm font-medium text-gray-700">Choose Type</span>
                </div>
                <div className="w-12 h-1 bg-gray-200 rounded">
                  <div className={`h-1 rounded transition-all duration-300 ${step === 'select' || step === 'configure' || step === 'confirm' ? 'bg-blue-500 w-full' : 'bg-gray-200 w-0'}`}></div>
                </div>
              </>
            )}
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getStepColor('select')}`}>
                {selectedAccounts.length > 0 ? '1' : '2'}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {(agentCategory === 'research' || agentCategory === 'customer-facing') ? 'Select & Configure' : 'Select Agent'}
              </span>
            </div>
            <div className="w-12 h-1 bg-gray-200 rounded">
              <div className={`h-1 rounded transition-all duration-300 ${
                (agentCategory === 'research' || agentCategory === 'customer-facing')
                  ? (step === 'confirm' ? 'bg-blue-500 w-full' : 'bg-gray-200 w-0')
                  : (step === 'configure' || step === 'confirm' ? 'bg-blue-500 w-full' : 'bg-gray-200 w-0')
              }`}></div>
            </div>
            {agentCategory !== 'research' && agentCategory !== 'customer-facing' && (
              <>
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getStepColor('configure')}`}>
                    {selectedAccounts.length > 0 ? '2' : '3'}
                  </div>
                  <span className="text-sm font-medium text-gray-700">Configure</span>
                </div>
                <div className="w-12 h-1 bg-gray-200 rounded">
                  <div className={`h-1 rounded transition-all duration-300 ${step === 'confirm' ? 'bg-blue-500 w-full' : 'bg-gray-200 w-0'}`}></div>
                </div>
              </>
            )}
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${getStepColor('confirm')}`}>
                {selectedAccounts.length > 0 
                  ? '3' 
                  : ((agentCategory === 'research' || agentCategory === 'customer-facing') ? '3' : '4')
                }
              </div>
              <span className="text-sm font-medium text-gray-700">Confirm</span>
            </div>
          </div>
        </div>

        {/* Selected Accounts Summary */}
        {selectedAccounts.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <Building className="w-5 h-5 text-gray-400" />
              <h3 className="font-medium text-gray-900">Selected Accounts ({selectedAccounts.length})</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedAccounts.map((account) => (
                <div key={account.id} className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
                  <span className="font-medium">{account.company_name}</span>
                  <span className="text-gray-500 ml-1">({account.account_tier})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {renderCurrentStep()}

        {/* Completion Success Screen */}
        {stepsCompleted.complete && (
          <div className="mt-8 text-center">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8 border border-green-200">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Agent Created Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Your {agentCategory === 'customer-facing' ? 'Customer-Facing' : 'Research'} agent has been configured and is ready to use.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className={`grid gap-4 text-sm ${agentCategory === 'research' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2'}`}>
                  <div>
                    <span className="font-medium text-gray-700">Agent Type:</span>
                    <p className="text-gray-900 capitalize">{selectedAgent?.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Recipients:</span>
                    <p className="text-gray-900">
                      {(() => {
                        let count = 0;
                        // Count HubSpot contacts
                        selectedCustomers.forEach(customerId => {
                          const customer = mockCustomers.find(c => c.id === customerId);
                          if (customer?.contacts) {
                            customer.contacts.forEach((_, index) => {
                              const contactId = `hubspot-${customerId}-${index}`;
                              if (hubspotEnrollment[contactId] !== false) count++;
                            });
                          }
                        });
                        // Count manual recipients
                        recipients.forEach(recipient => {
                          if (recipient.enrolled !== false) count++;
                        });
                        return count;
                      })()} enrolled
                    </p>
                  </div>
                  {agentCategory === 'research' && (
                    <div>
                      <span className="font-medium text-gray-700">Competitors:</span>
                      <p className="text-gray-900">{selectedCompetitors.length} selected</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Customers:</span>
                    <p className="text-gray-900">{selectedCustomers.length} selected</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Redirecting you back to {entryPoint === 'customers' ? 'customers' : 'agents'} page...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreateAgentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agent creation...</p>
        </div>
      </div>
    }>
      <CreateAgentPageContent />
    </Suspense>
  );
}