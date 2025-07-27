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
  const [step, setStep] = useState<'category' | 'select' | 'configure' | 'confirm'>('category');
  const [agentCategory, setAgentCategory] = useState<'customer-facing' | 'research' | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  // Comprehensive agent configuration
  const [agentConfig, setAgentConfig] = useState({
    // Common fields
    purpose: '',
    ai_suggestions_enabled: true,
    
    // Customer-facing specific fields
    outreach_frequency: '3days' as 'daily' | '3days' | 'weekly' | 'biweekly',
    max_attempts: 5,
    contact_methods: ['email'] as ('email' | 'phone' | 'linkedin')[],
    tone: 'professional' as 'friendly' | 'professional' | 'casual',
    message_style: 'concise' as 'concise' | 'detailed' | 'personalized',
    custom_message: '',
    
    // Research-specific fields
    research_frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    data_sources: ['web'] as ('web' | 'internal' | 'apis' | 'reports' | 'social' | 'news' | 'financial' | 'patents')[],
    report_format: 'executive' as 'executive' | 'detailed' | 'dashboard' | 'narrative',
    auto_insights: true,
    notification_threshold: 'medium' as 'low' | 'medium' | 'high',
    
    // Advanced configuration fields
    analysis_framework: '',
    success_metric: 'insights_quality' as 'insights_quality' | 'trend_accuracy' | 'actionability' | 'coverage_completeness',
    escalation_rules: '',
    confidence_threshold: 'medium' as 'high' | 'medium' | 'low' | 'experimental',
    business_context: ''
  });
  
  // AI configuration states
  const [showManualConfig, setShowManualConfig] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  
  // Research configuration progressive disclosure states
  const [showResearchConfig, setShowResearchConfig] = useState(false);
  const [showFocusLibrary, setShowFocusLibrary] = useState(false);
  const [showAnalysisLibrary, setShowAnalysisLibrary] = useState(false);
  const [showAlertsLibrary, setShowAlertsLibrary] = useState(false);
  const [showContextLibrary, setShowContextLibrary] = useState(false);
  const [researchPrompt, setResearchPrompt] = useState('');
  
  // Compact pill display states
  const [showAllFocus, setShowAllFocus] = useState(false);
  const [showAllAnalysis, setShowAllAnalysis] = useState(false);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [showAllContext, setShowAllContext] = useState(false);
  
  // Email template states (customer-facing agents)
  const [showEmailTemplates, setShowEmailTemplates] = useState(false);
  const [templatesExpanded, setTemplatesExpanded] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [exampleEmail, setExampleEmail] = useState('');
  const [emailTemplates, setEmailTemplates] = useState({
    initial_outreach: '',
    follow_up_1: '',
    follow_up_2: '',
    meeting_request: '',
    final_attempt: ''
  });

  // Customer/Recipient management states (customer-facing agents)
  const [selectedAccounts, setSelectedAccounts] = useState<SelectedAccount[]>([]);
  const [showCustomerSelection, setShowCustomerSelection] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
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
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [newRecipient, setNewRecipient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'User' as 'Admin' | 'User',
    title: '',
    accountId: '',
    accountName: ''
  });

  // Compact pill display component
  const renderCompactPills = (items: string[], onRemove: (index: number) => void, showAll: boolean = false, onToggleShowAll?: () => void) => {
    const displayItems = showAll ? items : items.slice(0, 3);
    const hasMore = items.length > 3;

    return (
      <div className="flex flex-wrap gap-2 items-center">
        {displayItems.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
          >
            {item}
            <button
              onClick={() => onRemove(showAll ? index : index)}
              className="ml-1 text-blue-600 hover:text-blue-800"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {hasMore && !showAll && (
          <button
            onClick={onToggleShowAll}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-3 h-3 mr-1" />
            {items.length - 3} more
          </button>
        )}
        {hasMore && showAll && (
          <button
            onClick={onToggleShowAll}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ChevronUp className="w-3 h-3 mr-1" />
            Show less
          </button>
        )}
      </div>
    );
  };

  // Mock customer and contact data (in real app, would come from HubSpot API)
  const mockCustomers = [
    { id: 'customer-001', name: 'MarketingCorp', tier: 'Growth', status: 'Active' },
    { id: 'customer-002', name: 'TechStart Inc', tier: 'Starter', status: 'Active' },
    { id: 'customer-003', name: 'GlobalCorp', tier: 'Enterprise', status: 'Active' },
    { id: 'customer-004', name: 'InnovateTech', tier: 'Starter', status: 'Onboarding' },
    { id: 'customer-005', name: 'FinancePlus', tier: 'Growth', status: 'At Risk' },
    { id: 'customer-006', name: 'DataFlow Systems', tier: 'Enterprise', status: 'Active' },
    { id: 'customer-007', name: 'CloudScale Inc', tier: 'Growth', status: 'Active' },
    { id: 'customer-008', name: 'AutomateMe', tier: 'Starter', status: 'Active' },
    { id: 'customer-009', name: 'SecureNet', tier: 'Enterprise', status: 'Active' },
    { id: 'customer-010', name: 'ScaleUp Solutions', tier: 'Growth', status: 'Active' },
    { id: 'customer-011', name: 'DevOps Pro', tier: 'Starter', status: 'Active' },
    { id: 'customer-012', name: 'Analytics Plus', tier: 'Growth', status: 'At Risk' }
  ];

  // Mock contact data for each customer account
  const mockAccountContacts = {
    'customer-001': [
      { firstName: 'John', lastName: 'Smith', email: 'john.smith@marketingcorp.com', role: 'Admin' as const, title: 'VP Marketing' },
      { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@marketingcorp.com', role: 'User' as const, title: 'Marketing Manager' }
    ],
    'customer-002': [
      { firstName: 'Lisa', lastName: 'Wong', email: 'lisa.wong@techstart.com', role: 'Admin' as const, title: 'CEO' },
      { firstName: 'Mike', lastName: 'Chen', email: 'mike.chen@techstart.com', role: 'User' as const, title: 'CTO' }
    ],
    'customer-003': [
      { firstName: 'David', lastName: 'Brown', email: 'david.brown@globalcorp.com', role: 'Admin' as const, title: 'Director of Operations' },
      { firstName: 'Emma', lastName: 'Davis', email: 'emma.davis@globalcorp.com', role: 'User' as const, title: 'Operations Manager' },
      { firstName: 'James', lastName: 'Wilson', email: 'james.wilson@globalcorp.com', role: 'User' as const, title: 'Senior Analyst' }
    ],
    'customer-004': [
      { firstName: 'Anna', lastName: 'Taylor', email: 'anna.taylor@innovatetech.com', role: 'Admin' as const, title: 'Founder' }
    ],
    'customer-005': [
      { firstName: 'Robert', lastName: 'Miller', email: 'robert.miller@financeplus.com', role: 'Admin' as const, title: 'CFO' },
      { firstName: 'Jennifer', lastName: 'Garcia', email: 'jennifer.garcia@financeplus.com', role: 'User' as const, title: 'Finance Manager' }
    ]
  };

  // Filter function for customers
  const filteredCustomers = mockCustomers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.tier.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.status.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );

  // Auto-generate recipients from selected customers
  useEffect(() => {
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
    
    // Keep manual recipients and add auto-generated ones
    setRecipients(prev => [
      ...prev.filter(r => r.source === 'manual'),
      ...autoRecipients
    ]);
    
    if (autoRecipients.length > 0) {
      setShowRecipientList(true);
    }
  }, [selectedCustomers]);

  // Handle entry point from customers page with pre-selected accounts
  useEffect(() => {
    // Load selected accounts from localStorage if coming from customers page
    const selectedAccountIds = JSON.parse(localStorage.getItem('selectedAccountsForAgent') || '[]');
    
    if (entryPoint === 'customers' && selectedAccountIds.length > 0) {
      // Coming from customers page - skip category selection, go straight to customer-facing
      setAgentCategory('customer-facing');
      setStep('select');
      
      // Mock account data - in real app, this would come from API
      const mockAccounts = [
        { id: 'account-001', company_name: 'MarketingCorp', account_tier: 'Growth', status: 'Active', primary_contact: 'John Smith' },
        { id: 'account-002', company_name: 'TechStart Inc', account_tier: 'Starter', status: 'Active', primary_contact: 'Lisa Wong' },
        { id: 'account-003', company_name: 'GlobalCorp', account_tier: 'Enterprise', status: 'Active', primary_contact: 'David Brown' },
        { id: 'account-004', company_name: 'InnovateTech', account_tier: 'Starter', status: 'Onboarding', primary_contact: 'Anna Taylor' },
        { id: 'account-005', company_name: 'FinancePlus', account_tier: 'Growth', status: 'At Risk', primary_contact: 'Robert Miller' }
      ];
      
      const accounts = mockAccounts.filter(account => selectedAccountIds.includes(account.id));
      setSelectedAccounts(accounts);
      
      // Pre-populate Target Customers with selected accounts
      const preselectedCustomerIds = accounts.map(account => {
        // Map account IDs to customer IDs (in real app, this would be based on actual data relationships)
        const customerMapping = {
          'account-001': 'customer-001', // MarketingCorp
          'account-002': 'customer-002', // TechStart Inc
          'account-003': 'customer-003', // GlobalCorp
          'account-004': 'customer-004', // InnovateTech
          'account-005': 'customer-005'  // FinancePlus
        };
        return customerMapping[account.id as keyof typeof customerMapping];
      }).filter(Boolean);
      
      setSelectedCustomers(preselectedCustomerIds);
    } else {
      // Coming from agents dashboard - start with category selection
      setStep('category');
      setAgentCategory(null);
    }
  }, [entryPoint]);

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
      color: 'blue'
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
      color: 'green'
    }
  ];

  const availableAgents = agentCategory === 'customer-facing' ? customerFacingAgents : researchAgents;

  // Navigation handlers
  const handleNext = () => {
    if (step === 'category' && agentCategory) {
      setStep('select');
    } else if (step === 'select' && selectedAgent) {
      setStep('configure');
    } else if (step === 'configure') {
      // For research agents, require purpose (research focus areas)
      // For customer-facing agents, purpose is optional (handled via AI configuration)
      if (agentCategory === 'research' && !agentConfig.purpose) {
        return; // Don't proceed if research agent has no purpose
      }
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'select') {
      // If we came from customers page, go back to customers
      if (entryPoint === 'customers') {
        window.location.href = '/customers';
      } else {
        // Otherwise go back to category selection
        setStep('category');
      }
    } else if (step === 'configure') {
      setStep('select');
    } else if (step === 'confirm') {
      setStep('configure');
    } else if (step === 'category') {
      // Always go back to agents dashboard
      window.location.href = '/agents';
    }
  };

  // Helper functions for n8n integration
  const mapAgentTypeToWorkflow = (agentType: string): 'renewal' | 'health' | 'competitive' | 'market-trends' => {
    if (agentType.includes('Renewal')) return 'renewal';
    if (agentType.includes('Health')) return 'health';
    if (agentType.includes('Competitive') || agentType.includes('Intelligence')) return 'competitive';
    if (agentType.includes('Market') || agentType.includes('Research')) return 'market-trends';
    return 'renewal'; // Default fallback
  };

  const getScheduleFromFrequency = (frequency: string): string => {
    // Convert frequency to cron expression
    switch (frequency) {
      case 'daily': return '0 9 * * *'; // Daily at 9 AM
      case '3days': return '0 9 */3 * *'; // Every 3 days at 9 AM
      case 'weekly': return '0 9 * * 1'; // Every Monday at 9 AM
      case 'biweekly': return '0 9 * * 1/2'; // Every other Monday at 9 AM
      case 'monthly': return '0 9 1 * *'; // First day of every month at 9 AM
      default: return '0 9 * * 1'; // Default to weekly
    }
  };

  const buildCustomerQuery = () => {
    // Build customer query filters based on selected customers and configuration
    const query: any = {};
    
    if (selectedCustomers.length > 0) {
      // If specific customers are selected, we could add them as a filter
      // For now, we'll use this to determine targeting strategy
      query.specificCustomers = selectedCustomers;
    }

    // Add filters based on agent category and configuration
    if (agentCategory === 'customer-facing') {
      if (selectedAgent?.includes('renewal')) {
        query.renewalDueInDays = 90; // Target customers with renewals due in 90 days
      } else if (selectedAgent?.includes('health')) {
        query.healthThreshold = 70; // Target customers with health score below 70
        query.daysInactive = 30; // Target customers inactive for 30+ days
      }
    }

    return query;
  };

  const getCompetitorIds = (): string[] => {
    // For research agents, return relevant competitor IDs
    // In a real implementation, this would be based on user selection or configuration
    return ['competitor-001', 'competitor-002', 'competitor-003'];
  };

  const handleCreateAgent = async () => {
    const agent = availableAgents.find(a => a.id === selectedAgent);
    if (!agent) return;

    try {
      // Create agent data for platform storage
      const newAgent = {
        id: selectedAgent,
        name: agent.name,
        type: agent.type,
        category: agentCategory,
        config: agentConfig,
        created: new Date().toISOString(),
        status: 'creating',
        assigned_accounts: agentCategory === 'customer-facing' ? selectedAccounts.length : 0,
        total_contacts: agentCategory === 'customer-facing' ? recipients.length : 0,
        selected_customers: agentCategory === 'customer-facing' ? selectedCustomers : [],
        recipients: agentCategory === 'customer-facing' ? recipients : [],
        email_templates: agentCategory === 'customer-facing' ? emailTemplates : {},
        n8n_workflow_id: null
      };

      // Store agent in localStorage first
      const existingAgents = JSON.parse(localStorage.getItem('activeAgents') || '[]');
      existingAgents.push(newAgent);
      localStorage.setItem('activeAgents', JSON.stringify(existingAgents));

      // Create n8n workflow
      const workflowConfig = {
        agentId: selectedAgent,
        agentType: mapAgentTypeToWorkflow(agent.type),
        name: `${agent.name} - ${new Date().toLocaleDateString()}`,
        schedule: getScheduleFromFrequency(agentConfig.outreach_frequency || agentConfig.research_frequency),
        customerQuery: buildCustomerQuery(),
        competitorIds: agentCategory === 'research' ? getCompetitorIds() : undefined,
        emailTemplates: agentCategory === 'customer-facing' ? emailTemplates : undefined,
        settings: {
          tone: agentConfig.tone || 'professional',
          frequency: agentConfig.outreach_frequency || agentConfig.research_frequency || 'weekly',
          maxAttempts: agentConfig.max_attempts || 3
        }
      };

      // Call n8n integration API to create workflow
      const response = await fetch('/api/agents/create-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to create n8n workflow');
      }

      const { workflowId } = await response.json();

      // Update agent with workflow ID
      newAgent.n8n_workflow_id = workflowId;
      newAgent.status = 'active';
      
      // Update localStorage with workflow ID
      const updatedAgents = existingAgents.map((a: any) => 
        a.id === selectedAgent ? newAgent : a
      );
      localStorage.setItem('activeAgents', JSON.stringify(updatedAgents));

      // Clear selected accounts if any
      localStorage.removeItem('selectedAccountsForAgent');

      // Show success and redirect
      const accountText = agentCategory === 'customer-facing' && selectedAccounts.length > 0 
        ? ` for ${selectedAccounts.length} account${selectedAccounts.length !== 1 ? 's' : ''}` 
        : '';
      alert(`Successfully created ${agent.name}${accountText} with active n8n workflow!`);
      window.location.href = '/agents';

    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent. Please try again.');
      
      // Update status to failed if workflow creation failed
      const agents = JSON.parse(localStorage.getItem('activeAgents') || '[]');
      const updatedAgents = agents.map((a: any) => 
        a.id === selectedAgent ? { ...a, status: 'failed' } : a
      );
      localStorage.setItem('activeAgents', JSON.stringify(updatedAgents));
    }
  };

  const renderCategorySelection = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Agent</h1>
        <p className="text-lg text-gray-600">Choose the type of agent you'd like to create</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => {
            setAgentCategory('customer-facing');
            setStep('select');
          }}
          className="text-left p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <h5 className="text-xl font-semibold text-gray-900 mb-2">Customer-Facing Agent</h5>
          <p className="text-gray-600 mb-4">Automate customer outreach, renewal management, and relationship building</p>
        </button>

        <button
          onClick={() => {
            setAgentCategory('research');
            setStep('select');
          }}
          className="text-left p-6 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h5 className="text-xl font-semibold text-gray-900 mb-2">Research Agent</h5>
          <p className="text-gray-600 mb-4">Automate market research, competitive analysis, and data collection</p>
        </button>
      </div>
    </div>
  );

  const renderAgentSelection = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {agentCategory === 'customer-facing' ? 'Customer-Facing Agents' : 'Research Agents'}
        </h1>
        <p className="text-lg text-gray-600">Choose the specific agent type that fits your needs</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {availableAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => {
                setSelectedAgent(agent.id);
                setStep('configure');
              }}
              className={`text-left p-6 rounded-lg border-2 transition-all ${
                selectedAgent === agent.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <h5 className="font-semibold text-gray-900 text-lg mb-1">{agent.name}</h5>
              <p className="text-gray-600 text-sm mb-3">{agent.description}</p>
            </button>
          ))}
      </div>
    </div>
  );

  const renderCombinedResearchFlow = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Research Agent</h1>
          <p className="text-lg text-gray-600">Select and configure your research agent</p>
        </div>

        <div className="space-y-6">
          <div className="calendly-card-static">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Select Research Agent</h2>
              <div className="grid grid-cols-1 gap-4">
                {availableAgents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent.id)}
                      className={`text-left p-4 rounded-lg border transition-all ${
                        selectedAgent === agent.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">{agent.name}</h3>
                      <p className="text-sm text-gray-600">{agent.description}</p>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCombinedCustomerFacingFlow = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Customer-Facing Agent</h1>
          <p className="text-lg text-gray-600">Select and configure your customer-facing agent</p>
        </div>

        <div className="space-y-6">
          <div className="calendly-card-static">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Select Agent Type</h2>
              <div className="grid grid-cols-1 gap-4">
                {availableAgents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent.id)}
                      className={`text-left p-4 rounded-lg border transition-all ${
                        selectedAgent === agent.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">{agent.name}</h3>
                      <p className="text-sm text-gray-600">{agent.description}</p>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // AI Configuration Function
  const generateAIConfiguration = () => {
    const agent = availableAgents.find(a => a.id === selectedAgent);
    if (!agent) return;
    
    let optimizedConfig = { ...agentConfig };
    
    // AI optimization based on agent type
    if (agent.type === 'Renewal Specialist') {
      optimizedConfig = {
        ...optimizedConfig,
        outreach_frequency: 'weekly',
        max_attempts: 4,
        tone: 'professional',
        message_style: 'personalized'
      };
    } else if (agent.type === 'Health Specialist') {
      optimizedConfig = {
        ...optimizedConfig,
        outreach_frequency: '3days',
        max_attempts: 5,
        tone: 'friendly',
        message_style: 'detailed'
      };
    }
    
    setAgentConfig(optimizedConfig);
    setAiGenerated(true);
  };

  // Generate email templates based on agent type and configuration
  const generateEmailTemplates = () => {
    if (agentCategory === 'research') {
      // Don't generate email templates for research agents
      return;
    }
    
    const agent = availableAgents.find(a => a.id === selectedAgent);
    if (!agent) return;

    // Generate comprehensive email templates based on agent configuration
    const templates = {
      initial_outreach: generateInitialOutreachTemplate(agent),
      follow_up_1: generateFollowUpTemplate(agent, 1),
      follow_up_2: generateFollowUpTemplate(agent, 2),
      meeting_request: generateMeetingRequestTemplate(agent),
      final_attempt: generateFinalAttemptTemplate(agent)
    };

    setEmailTemplates(templates);
    setShowEmailTemplates(true);
  };

  const generateInitialOutreachTemplate = (agent: any) => {
    const baseTemplates = {
      'Renewal Specialist': `Hi [First Name],

I hope this message finds you well. I'm reaching out because your [Product/Service] subscription is coming up for renewal in the next few weeks.

I wanted to personally ensure you're getting the most value from your investment and discuss how we can continue supporting your success.

Could we schedule a brief 15-minute call to review your current usage and explore any new features that might benefit [Company Name]?

Best regards,
[Your Name]`,
      'Health Specialist': `Hello [First Name],

I hope you're doing well! I wanted to check in on how things are going with [Product/Service] at [Company Name].

As your dedicated health specialist, I'm here to ensure you're maximizing the value from our platform and achieving your business goals.

I'd love to schedule a quick 15-minute call to discuss your current experience and see if there are any ways we can better support your team.

Looking forward to connecting,
[Your Name]`,
      'Relationship Manager': `Hi [First Name],

I hope this message finds you well. I'm [Your Name], your dedicated relationship manager at [Company Name].

I wanted to personally introduce myself and see how your experience with [Product/Service] has been so far.

I'm here to ensure you're getting maximum value from our partnership and to address any questions or opportunities that might arise.

Would you be available for a brief 15-minute call this week to connect and discuss how we can best support your goals?

Best regards,
[Your Name]`,
      'Onboarding Specialist': `Hello [First Name],

Welcome to [Company Name]! I'm [Your Name], your dedicated onboarding specialist, and I'm excited to help you get the most out of [Product/Service].

I wanted to personally reach out to see how your initial setup is going and ensure you have everything you need to succeed.

Could we schedule a 20-minute call this week to walk through any questions you might have and optimize your configuration for your specific needs?

Looking forward to working with you,
[Your Name]`
    };

    return baseTemplates[agent.type as keyof typeof baseTemplates] || baseTemplates['Relationship Manager'];
  };

  const generateFollowUpTemplate = (agent: any, followUpNumber: number) => {
    const followUpTemplates = {
      1: {
        'Renewal Specialist': `Hi [First Name],

I wanted to follow up on my previous message about your upcoming [Product/Service] renewal.

I understand you're likely busy, but I wanted to make sure you have all the information you need to make the best decision for [Company Name].

If you have any questions about your renewal options or would like to discuss how we can better support your team, I'm here to help.

Would a brief 10-minute call work for you this week?

Best,
[Your Name]`,
        'Health Specialist': `Hello [First Name],

I hope you're having a great week! I wanted to circle back on connecting about your [Product/Service] experience.

I've been reviewing your account and noticed some opportunities where we might be able to optimize your setup for even better results.

No pressure at all – just wanted to make sure you know I'm here as a resource whenever you need support.

Would you be interested in a quick 10-minute call to discuss?

Warm regards,
[Your Name]`,
      },
      2: {
        'Renewal Specialist': `Hi [First Name],

I hope all is well. This is my final follow-up regarding your [Product/Service] renewal.

I want to respect your time while ensuring you have the support you need. If you'd like to discuss your renewal or have any questions, I'm available this week.

Otherwise, I'll make sure you receive all necessary renewal information via email and you can proceed at your own pace.

Thank you for being a valued customer.

Best regards,
[Your Name]`,
        'Health Specialist': `Hello [First Name],

I hope everything is going smoothly with [Product/Service] at [Company Name].

This will be my last proactive outreach, as I want to respect your time and inbox. Just know that I'm always here if you need any support or have questions about maximizing your platform usage.

Feel free to reach out anytime – my door is always open.

Best wishes,
[Your Name]`,
      }
    };

    const templates = followUpTemplates[followUpNumber as keyof typeof followUpTemplates];
    return templates[agent.type as keyof typeof templates] || templates['Health Specialist'];
  };

  const generateMeetingRequestTemplate = (agent: any) => {
    return `Hi [First Name],

Thank you for your interest in connecting! I'd love to schedule a brief call to discuss how we can better support [Company Name] with [Product/Service].

I have a few time slots available this week:
• [Day] at [Time]
• [Day] at [Time]  
• [Day] at [Time]

Does any of these work for you? If not, please let me know what times work better and I'll accommodate your schedule.

Looking forward to our conversation!

Best,
[Your Name]`;
  };

  const generateFinalAttemptTemplate = (agent: any) => {
    return `Hi [First Name],

I hope this message finds you well. This is my final outreach regarding [specific topic/opportunity].

I completely understand that priorities shift and timing isn't always perfect. I want to respect your time while leaving the door open for future conversations.

If you'd ever like to connect about [Product/Service] or how we can support [Company Name], please don't hesitate to reach out. I'm always here to help.

Wishing you and your team continued success.

Best regards,
[Your Name]`;
  };

  const regenerateTemplate = (templateKey: string) => {
    const agent = availableAgents.find(a => a.id === selectedAgent);
    if (!agent) return;

    const currentTemplate = emailTemplates[templateKey as keyof typeof emailTemplates];
    if (!currentTemplate) return;

    // Analyze the current template and rewrite it
    const toneAdjustment = exampleEmail ? 
      `Following the tone and style from this example: "${exampleEmail.substring(0, 200)}..."` : 
      `Using a ${agentConfig.tone} tone with ${agentConfig.message_style} messaging.`;

    // For demonstration, we'll create variations
    let newTemplate = currentTemplate;
    
    if (templateKey === 'initial_outreach') {
      newTemplate = generateInitialOutreachTemplate(agent);
    } else if (templateKey.includes('follow_up')) {
      const followUpNum = templateKey === 'follow_up_1' ? 1 : 2;
      newTemplate = generateFollowUpTemplate(agent, followUpNum);
    } else if (templateKey === 'meeting_request') {
      newTemplate = generateMeetingRequestTemplate(agent);
    } else if (templateKey === 'final_attempt') {
      newTemplate = generateFinalAttemptTemplate(agent);
    }

    // Apply tone and style adjustments based on configuration
    if (agentConfig.tone === 'casual') {
      newTemplate = newTemplate.replace(/Best regards,/g, 'Cheers,')
                               .replace(/I hope this message finds you well./g, 'Hope you\'re doing great!')
                               .replace(/Thank you for being a valued customer./g, 'Thanks for being awesome!');
    } else if (agentConfig.tone === 'friendly') {
      newTemplate = newTemplate.replace(/Best regards,/g, 'Warm regards,')
                               .replace(/I hope this message finds you well./g, 'I hope you\'re having a wonderful day!');
    }

    setEmailTemplates(prev => ({
      ...prev,
      [templateKey]: newTemplate
    }));
  };

  const renderConfiguration = () => {
    if (agentCategory === 'research') {
      return (
        <div>
          <div className="text-center mb-6">
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Configure Research Agent</h4>
            <p className="text-gray-600">Set up your research parameters and analysis approach</p>
          </div>

          {/* n8n Workflow Integration Notice */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h6 className="font-medium text-purple-900">n8n Workflow Automation</h6>
                <p className="text-sm text-purple-700 mt-1">
                  This agent will create an automated n8n workflow that monitors your research focus areas and delivers insights on your schedule
                </p>
              </div>
            </div>
          </div>

          {/* AI-Powered Configuration */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h6 className="font-medium text-blue-900">AI-Powered Configuration</h6>
                  <p className="text-sm text-blue-700 mt-1">
                    Optimize your research strategy with AI recommendations
                  </p>
                </div>
              </div>
              {!aiGenerated ? (
                <button
                  onClick={generateAIConfiguration}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>AI Optimize</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 text-blue-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Configuration Optimized</span>
                </div>
              )}
            </div>
            
            {!aiGenerated && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-blue-800 mb-2">Research Goals (Optional)</label>
                <textarea
                  value={researchPrompt}
                  onChange={(e) => setResearchPrompt(e.target.value)}
                  placeholder="e.g., I want to monitor competitor pricing strategies and identify market opportunities..."
                  className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/50"
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Advanced Research Configuration with Expandable Libraries */}
          <div className="space-y-8">
            {/* 1. Research Focus Areas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Research Focus Areas *</label>
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
                      setAgentConfig(prev => ({ ...prev, purpose: items.join(', ') }));
                    },
                    showAllFocus,
                    () => setShowAllFocus(!showAllFocus)
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
                        'conversion rates', 'retention metrics', 'user feedback', 'product analytics'
                      ] :
                      [
                        'content performance', 'seo rankings', 'engagement metrics', 'conversion rates',
                        'traffic sources', 'bounce rates', 'time on page', 'social shares',
                        'search trends', 'keyword rankings', 'competitor content', 'audience insights'
                      ]
                    ).map((focus) => {
                      const selectedFocus = agentConfig.purpose?.split(', ') || [];
                      const isSelected = selectedFocus.includes(focus);
                      
                      return (
                        <button
                          key={focus}
                          onClick={() => {
                            if (isSelected) {
                              const newFocus = selectedFocus.filter(item => item !== focus);
                              setAgentConfig(prev => ({ ...prev, purpose: newFocus.join(', ') }));
                            } else {
                              const newFocus = [...selectedFocus, focus];
                              setAgentConfig(prev => ({ ...prev, purpose: newFocus.join(', ') }));
                            }
                          }}
                          className={`text-left text-xs p-2 rounded border transition-colors ${
                            isSelected ? 'bg-purple-100 border-purple-300 text-purple-800' : 'bg-white border-gray-200 hover:border-purple-200 hover:bg-purple-50'
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
                      setAgentConfig(prev => ({ ...prev, analysis_framework: items.join(', ') }));
                    },
                    showAllAnalysis,
                    () => setShowAllAnalysis(!showAllAnalysis)
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
                              const newApproaches = selectedApproaches.filter(item => item !== approach);
                              setAgentConfig(prev => ({ ...prev, analysis_framework: newApproaches.join(', ') }));
                            } else {
                              const newApproaches = [...selectedApproaches, approach];
                              setAgentConfig(prev => ({ ...prev, analysis_framework: newApproaches.join(', ') }));
                            }
                          }}
                          className={`text-left text-xs p-2 rounded border transition-colors ${
                            isSelected ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50'
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

            {/* 3. Alert Triggers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Alert Triggers</label>
                <button
                  onClick={() => setShowAlertsLibrary(!showAlertsLibrary)}
                  className="text-sm text-orange-600 hover:text-orange-700 transition-colors flex items-center space-x-1"
                >
                  {showAlertsLibrary ? (
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
                      setAgentConfig(prev => ({ ...prev, escalation_rules: items.join(', ') }));
                    },
                    showAllAlerts,
                    () => setShowAllAlerts(!showAllAlerts)
                  )}
                </div>
              )}
              
              {/* Expandable Alerts Library */}
              {showAlertsLibrary && (
                <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      'Alert for price changes >10%', 'Alert for new product launches', 'Alert for partnership announcements',
                      'Alert for executive changes', 'Alert for funding news', 'Alert for market shifts >15%',
                      'Alert for regulatory updates', 'Alert for competitor acquisitions', 'Alert for usage drops >10%',
                      'Alert for feature adoption <50%', 'Alert for user complaints', 'Alert for traffic drops >15%',
                      'Alert for engagement decline', 'Alert for conversion drops', 'Alert for churn increases',
                      'Alert for performance issues', 'Alert for security updates', 'Alert for policy changes'
                    ].map((alert) => {
                      const selectedAlerts = agentConfig.escalation_rules?.split(', ') || [];
                      const isSelected = selectedAlerts.includes(alert);
                      
                      return (
                        <button
                          key={alert}
                          onClick={() => {
                            if (isSelected) {
                              const newAlerts = selectedAlerts.filter(item => item !== alert);
                              setAgentConfig(prev => ({ ...prev, escalation_rules: newAlerts.join(', ') }));
                            } else {
                              const newAlerts = [...selectedAlerts, alert];
                              setAgentConfig(prev => ({ ...prev, escalation_rules: newAlerts.join(', ') }));
                            }
                          }}
                          className={`text-left text-xs p-2 rounded border transition-colors ${
                            isSelected ? 'bg-orange-100 border-orange-300 text-orange-800' : 'bg-white border-gray-200 hover:border-orange-200 hover:bg-orange-50'
                          }`}
                        >
                          {alert}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Business Context */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Business Context</label>
                <button
                  onClick={() => setShowContextLibrary(!showContextLibrary)}
                  className="text-sm text-green-600 hover:text-green-700 transition-colors flex items-center space-x-1"
                >
                  {showContextLibrary ? (
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
              
              {agentConfig.business_context && (
                <div className="mb-3">
                  {renderCompactPills(
                    agentConfig.business_context.split(', ').filter(item => item.trim()),
                    (index) => {
                      const items = agentConfig.business_context.split(', ').filter(item => item.trim());
                      items.splice(index, 1);
                      setAgentConfig(prev => ({ ...prev, business_context: items.join(', ') }));
                    },
                    showAllContext,
                    () => setShowAllContext(!showAllContext)
                  )}
                </div>
              )}
              
              {/* Expandable Context Library */}
              {showContextLibrary && (
                <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      // Business Model
                      'B2B SaaS', 'B2C Platform', 'B2B2C Model', 'Marketplace',
                      'E-commerce', 'Enterprise Software', 'Consumer Apps', 'Healthcare Tech',
                      // Company Stage
                      'Startup', 'Growth stage', 'Enterprise', 'Public company',
                      'Pre-revenue', 'Series A', 'Series B+', 'Bootstrapped',
                      // Industry
                      'High-tech', 'Fintech', 'Healthcare', 'Education',
                      'Retail', 'Manufacturing', 'Professional Services', 'Media',
                      // Market Focus
                      'SMB focus', 'Enterprise focus', 'Consumer focus', 'Developer tools',
                      'AI/ML focus', 'Mobile-first', 'Cloud-native', 'API-first'
                    ].map((context) => {
                      const selectedContexts = agentConfig.business_context?.split(', ') || [];
                      const isSelected = selectedContexts.includes(context);
                      
                      return (
                        <button
                          key={context}
                          onClick={() => {
                            if (isSelected) {
                              const newContexts = selectedContexts.filter(item => item !== context);
                              setAgentConfig(prev => ({ ...prev, business_context: newContexts.join(', ') }));
                            } else {
                              const newContexts = [...selectedContexts, context];
                              setAgentConfig(prev => ({ ...prev, business_context: newContexts.join(', ') }));
                            }
                          }}
                          className={`text-left text-xs p-2 rounded border transition-colors ${
                            isSelected ? 'bg-green-100 border-green-300 text-green-800' : 'bg-white border-gray-200 hover:border-green-200 hover:bg-green-50'
                          }`}
                        >
                          {context}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Customer-facing agent configuration
    return (
      <div>
        <div className="text-center mb-6">
          <h4 className="text-xl font-semibold text-gray-900 mb-2">Configure Customer-Facing Agent</h4>
          <p className="text-gray-600">Set up your outreach strategy and communication preferences</p>
        </div>

        {/* n8n Workflow Integration Notice */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h6 className="font-medium text-purple-900">n8n Workflow Automation</h6>
              <p className="text-sm text-purple-700 mt-1">
                This agent will create an automated n8n workflow that connects to your customer data and executes actions on your schedule
              </p>
            </div>
          </div>
        </div>

        {/* AI-Powered Configuration */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
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
                onClick={generateAIConfiguration}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>AI Optimize</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 text-blue-700">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Configuration Optimized</span>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Fields */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Outreach Frequency
              </label>
              <select
                value={agentConfig.outreach_frequency}
                onChange={(e) => setAgentConfig(prev => ({ ...prev, outreach_frequency: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="3days">Every 3 Days</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Attempts
              </label>
              <input
                type="number"
                value={agentConfig.max_attempts}
                onChange={(e) => setAgentConfig(prev => ({ ...prev, max_attempts: parseInt(e.target.value) }))}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Communication Tone
              </label>
              <select
                value={agentConfig.tone}
                onChange={(e) => setAgentConfig(prev => ({ ...prev, tone: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="casual">Casual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Style
              </label>
              <select
                value={agentConfig.message_style}
                onChange={(e) => setAgentConfig(prev => ({ ...prev, message_style: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="concise">Concise</option>
                <option value="detailed">Detailed</option>
                <option value="personalized">Personalized</option>
              </select>
            </div>
          </div>

          {/* Email Template Generation Section */}
          <div className="mb-6">
            <div className="mb-4">
              <h5 className="text-lg font-semibold text-gray-900 mb-1">Email Campaign Setup</h5>
              <p className="text-sm text-gray-600">Generate and configure your email templates</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h6 className="font-medium text-blue-900">AI Email Template Generation</h6>
                    <p className="text-sm text-blue-700 mt-1">
                      Generate a {Math.ceil(agentConfig.max_attempts * (agentConfig.outreach_frequency === 'daily' ? 1 : agentConfig.outreach_frequency === '3days' ? 3 : agentConfig.outreach_frequency === 'weekly' ? 7 : 14))} day email campaign with personalized templates
                    </p>
                  </div>
                </div>
                {!showEmailTemplates ? (
                  <button
                    onClick={generateEmailTemplates}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Generate Templates</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Templates Generated</span>
                  </div>
                )}
              </div>
              
              {/* Example Email Field - Only show if templates not generated */}
              {!showEmailTemplates && (
                <div>
                  <label className="block text-sm font-medium text-blue-800 mb-2">
                    Example Email (Optional)
                  </label>
                  <textarea
                    value={exampleEmail}
                    onChange={(e) => setExampleEmail(e.target.value)}
                    placeholder="Paste an example email that represents your writing style and tone. The AI will match this style when generating templates."
                    className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/50"
                    rows={4}
                  />
                  <div className="text-xs text-blue-700 mt-2 flex items-center space-x-1">
                    <Mail className="w-3 h-3" />
                    <span>This helps the AI match your communication style and tone</span>
                  </div>
                </div>
              )}
            </div>

            {/* Email Templates Display */}
            {showEmailTemplates && templatesExpanded && (
              <div className="border border-gray-200 rounded-lg p-6 mb-6">
                <div className="mb-4">
                  <h6 className="font-medium text-gray-900">Email Template Details</h6>
                  <p className="text-sm text-gray-600 mt-1">
                    Edit and customize your generated email templates
                  </p>
                </div>
                
                {/* Combined Workflow + Templates */}
                <div className="space-y-4">
                  {Object.entries(emailTemplates).map(([key, template], index) => {
                    const templateNames = {
                      initial_outreach: 'Initial Outreach',
                      follow_up_1: 'Follow-up 1', 
                      follow_up_2: 'Follow-up 2',
                      meeting_request: 'Meeting Request',
                      final_attempt: 'Final Attempt'
                    };
                    
                    const dayOffset = index * (agentConfig.outreach_frequency === 'daily' ? 1 : agentConfig.outreach_frequency === '3days' ? 3 : agentConfig.outreach_frequency === 'weekly' ? 7 : 14);
                    
                    return (
                      <div key={key} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                            </div>
                            <div>
                              <h6 className="text-sm font-medium text-gray-900">
                                {templateNames[key as keyof typeof templateNames]}
                              </h6>
                              <p className="text-xs text-gray-500">
                                Day {dayOffset === 0 ? 'of signup' : dayOffset} • {agentConfig.outreach_frequency} frequency
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => regenerateTemplate(key)}
                              className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors flex items-center space-x-1"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Regenerate</span>
                            </button>
                            <button
                              onClick={() => setEditingTemplate(editingTemplate === key ? null : key)}
                              className="text-xs text-gray-600 hover:text-gray-700 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 transition-colors flex items-center space-x-1"
                            >
                              <Edit className="w-3 h-3" />
                              <span>{editingTemplate === key ? 'View' : 'Edit'}</span>
                            </button>
                          </div>
                        </div>
                        
                        {editingTemplate === key ? (
                          <textarea
                            value={template}
                            onChange={(e) => setEmailTemplates(prev => ({ ...prev, [key]: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                            rows={8}
                          />
                        ) : (
                          <div className="bg-gray-50 p-3 rounded border text-sm text-gray-700 whitespace-pre-wrap font-mono">
                            {template}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Customer/Recipient Selection Section */}
          <div className="mb-6">
            <div className="mb-4">
              <h5 className="text-lg font-semibold text-gray-900 mb-1">Target Setup</h5>
              <p className="text-sm text-gray-600">Configure your target customers and recipients</p>
            </div>

            {/* Customer Selection for Customer-Facing Agents */}
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h6 className="font-medium text-gray-900">Target Customers</h6>
                  <p className="text-sm text-gray-600 mt-1">
                    Select specific customers to focus on (optional for better targeting)
                  </p>
                </div>
                <button
                  onClick={() => setShowCustomerSelection(!showCustomerSelection)}
                  className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-1"
                >
                  {showCustomerSelection ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>Select Customers</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Selected customers display */}
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
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {showCustomerSelection && (
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
                        placeholder="Search customers..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        value={customerSearchQuery}
                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Customer List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {filteredCustomers.map((customer) => {
                      const isSelected = selectedCustomers.includes(customer.id);
                      return (
                        <div
                          key={customer.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCustomers(prev => prev.filter(id => id !== customer.id));
                            } else {
                              setSelectedCustomers(prev => [...prev, customer.id]);
                            }
                          }}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected 
                              ? 'border-blue-300 bg-blue-50 text-blue-900' 
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{customer.name}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {customer.tier} • {customer.status}
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {filteredCustomers.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <div className="text-sm">No customers found matching your search.</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recipient List - Auto-generates from selected customers */}
            {showRecipientList && recipients.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h6 className="font-medium text-gray-900">Contact Recipients ({recipients.length})</h6>
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
                
                {/* Recipients Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recipients.map((recipient) => (
                        <tr key={recipient.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {recipient.firstName} {recipient.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{recipient.email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{recipient.title}</div>
                            <div className={`text-xs ${recipient.role === 'Admin' ? 'text-blue-600' : 'text-gray-500'}`}>
                              {recipient.role}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {recipient.accountName}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              recipient.source === 'auto' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {recipient.source}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => setEditingRecipient(editingRecipient === recipient.id ? null : recipient.id)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {recipient.source === 'manual' && (
                              <button
                                onClick={() => setRecipients(prev => prev.filter(r => r.id !== recipient.id))}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
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
          </div>
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p>Confirmation details would go here...</p>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 'category':
        return renderCategorySelection();
      case 'select':
        return renderAgentSelection();
      case 'configure':
        return renderConfiguration();
      case 'confirm':
        return renderConfirmation();
      default:
        return renderCategorySelection();
    }
  };

  return (
    <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
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
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              {step !== 'category' && (
                <>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === 'select' || step === 'configure' || step === 'confirm' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      1
                    </div>
                    <span className="text-sm font-medium text-gray-700">Choose Type</span>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className={`h-1 rounded transition-all duration-300 ${step === 'select' || step === 'configure' || step === 'confirm' ? 'bg-blue-500 w-full' : 'bg-gray-200 w-0'}`}></div>
                  </div>
                </>
              )}
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'configure' || step === 'confirm' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium text-gray-700">Select Agent</span>
              </div>
              <div className="flex-1 mx-4">
                <div className={`h-1 rounded transition-all duration-300 ${step === 'configure' || step === 'confirm' ? 'bg-blue-500 w-full' : 'bg-gray-200 w-0'}`}></div>
              </div>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'confirm' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  3
                </div>
                <span className="text-sm font-medium text-gray-700">Configure</span>
              </div>
              <div className="flex-1 mx-4">
                <div className={`h-1 rounded transition-all duration-300 ${step === 'confirm' ? 'bg-blue-500 w-full' : 'bg-gray-200 w-0'}`}></div>
              </div>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'confirm' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  4
                </div>
                <span className="text-sm font-medium text-gray-700">Confirm</span>
              </div>
            </div>
          </div>

          {/* Selected Accounts Summary - Only show when accounts are selected */}
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

          {/* Main Content */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {renderCurrentStep()}
            
            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={handleBack}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>
                  {step === 'category' ? 'Back to Agents' :
                   step === 'select' && entryPoint === 'customers' ? 'Back to Customers' : 
                   'Back'}
                </span>
              </button>
              
              <button
                onClick={step === 'confirm' ? handleCreateAgent : handleNext}
                disabled={
                  (step === 'category' && !agentCategory) ||
                  (step === 'select' && !selectedAgent) ||
                  (step === 'configure' && agentCategory === 'research' && !agentConfig.purpose)
                }
                className="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 transition-colors flex items-center space-x-2"
              >
                <span>{step === 'confirm' ? 'Create Agent' : 'Next'}</span>
                {step === 'confirm' ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
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
