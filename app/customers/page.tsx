'use client';

import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Search,
  Building,
  User,
  Calendar,
  Activity,
  Eye,
  ExternalLink,
  Download,
  Bot,
  Target,
  TrendingUp,
  Users,
  ArrowRight,
  Settings
} from 'lucide-react';


interface HubSpotAccount {
  id: string;
  account_id: string;
  company_name: string;
  arr: number; // Annual Recurring Revenue
  csm: string; // Customer Success Manager
  cgm?: string; // Customer Growth Manager
  support_url?: string;
  account_tier: 'Enterprise' | 'Growth' | 'Starter';
  health_score: number;
  renewal_date: string;
  contract_start: string;
  primary_contact: string;
  primary_email: string;
  industry: string;
  employee_count: number;
  last_engagement: string;
  status: 'Active' | 'At Risk' | 'Churned' | 'Onboarding';
  region: string;
  lifecycle_stage: string;
  assigned_agent?: {
    agent_id: string;
    agent_name: string;
    agent_type: string;
    assigned_date: string;
    purpose: string;
    status: 'active' | 'paused' | 'completed';
    next_contact: string;
  };
}

interface AgentAssignmentConfig {
  agent_id: string;
  agent_name: string;
  agent_type: string;
  purpose: string;
  outreach_frequency: 'daily' | '3days' | 'weekly' | 'biweekly';
  max_attempts: number;
  contact_methods: ('email' | 'phone' | 'linkedin')[];
  stop_conditions: string[];
  custom_message: string;
  escalation_rules: {
    csm_notify_after: number;
    manager_notify_after: number;
  };
}

export default function CustomersPage() {
  const [accounts, setAccounts] = useState<HubSpotAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAgentWizard, setShowAgentWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<'select' | 'configure' | 'confirm'>('select');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentConfig, setAgentConfig] = useState({
    purpose: '',
    outreach_frequency: '3days' as const,
    max_attempts: 5,
    contact_methods: ['email'] as ('email' | 'phone' | 'linkedin')[],
    tone: 'professional' as 'friendly' | 'professional' | 'casual',
    message_style: 'concise' as 'concise' | 'detailed' | 'personalized',
    custom_message: '',
    ai_suggestions_enabled: true
  });
  const [showManualConfig, setShowManualConfig] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [agentActivities, setAgentActivities] = useState<{[key: string]: any}>({});
  const [lastActivityUpdate, setLastActivityUpdate] = useState<number>(Date.now());

  // Mock HubSpot accounts data
  const mockAccounts: HubSpotAccount[] = [
    {
      id: 'account-001',
      account_id: 'ACC-MKT-001',
      company_name: 'MarketingCorp',
      arr: 45000,
      csm: 'Sarah Johnson',
      cgm: 'Mike Chen',
      support_url: 'https://support.example.com/marketingcorp',
      assigned_agent: {
        agent_id: 'agent-renewal-001',
        agent_name: 'Renewal Outreach Agent',
        agent_type: 'Renewal Specialist',
        assigned_date: '2024-01-10',
        purpose: 'Schedule renewal discussion',
        status: 'active',
        next_contact: '2024-01-18'
      },
      account_tier: 'Growth',
      health_score: 85,
      renewal_date: '2024-12-15',
      contract_start: '2023-12-15',
      primary_contact: 'John Smith',
      primary_email: 'john.smith@marketingcorp.com',
      industry: 'Marketing Technology',
      employee_count: 250,
      last_engagement: '2024-01-15',
      status: 'Active',
      region: 'North America',
      lifecycle_stage: 'Customer'
    },
    {
      id: 'account-002',
      account_id: 'ACC-TCH-002',
      company_name: 'TechStart Inc',
      arr: 12000,
      csm: 'Jennifer Park',
      support_url: 'https://support.example.com/techstart',
      account_tier: 'Starter',
      health_score: 78,
      renewal_date: '2024-06-30',
      contract_start: '2023-06-30',
      primary_contact: 'Lisa Wong',
      primary_email: 'lisa.wong@techstart.com',
      industry: 'Software Development',
      employee_count: 45,
      last_engagement: '2024-01-14',
      status: 'Active',
      region: 'North America',
      lifecycle_stage: 'Customer'
    },
    {
      id: 'account-003',
      account_id: 'ACC-GLB-003',
      company_name: 'GlobalCorp',
      arr: 125000,
      csm: 'David Miller',
      cgm: 'Alex Thompson',
      support_url: 'https://support.example.com/globalcorp',
      account_tier: 'Enterprise',
      health_score: 95,
      renewal_date: '2024-08-01',
      contract_start: '2022-08-01',
      primary_contact: 'Robert Kim',
      primary_email: 'robert.kim@globalcorp.com',
      industry: 'Manufacturing',
      employee_count: 1200,
      last_engagement: '2024-01-13',
      status: 'Active',
      region: 'North America',
      lifecycle_stage: 'Customer'
    },
    {
      id: 'account-004',
      account_id: 'ACC-INV-004',
      company_name: 'InnovateTech',
      arr: 8500,
      csm: 'Emma Davis',
      account_tier: 'Starter',
      health_score: 65,
      renewal_date: '2024-03-20',
      contract_start: '2024-01-10',
      primary_contact: 'Sarah Johnson',
      primary_email: 'sarah.johnson@innovatetech.com',
      industry: 'Technology',
      employee_count: 85,
      last_engagement: '2024-01-12',
      status: 'Onboarding',
      region: 'North America',
      lifecycle_stage: 'Customer'
    },
    {
      id: 'account-005',
      account_id: 'ACC-FIN-005',
      company_name: 'FinancePlus',
      arr: 32000,
      csm: 'Michael Chen',
      support_url: 'https://support.example.com/financeplus',
      assigned_agent: {
        agent_id: 'agent-health-001',
        agent_name: 'Health Recovery Agent', 
        agent_type: 'Health Specialist',
        assigned_date: '2024-01-12',
        purpose: 'Improve account health and engagement',
        status: 'active',
        next_contact: '2024-01-16'
      },
      account_tier: 'Growth',
      health_score: 45,
      renewal_date: '2024-02-28',
      contract_start: '2023-02-28',
      primary_contact: 'Amanda Davis',
      primary_email: 'amanda.davis@financeplus.com',
      industry: 'Financial Services',
      employee_count: 180,
      last_engagement: '2023-12-15',
      status: 'At Risk',
      region: 'North America',
      lifecycle_stage: 'Customer'
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch HubSpot account data
    setLoading(true);
    setTimeout(() => {
      setAccounts(mockAccounts);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    setShowBulkActions(selectedAccounts.length > 0);
  }, [selectedAccounts]);

  // Simulate real-time agent activity updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAgentActivities(prev => {
        const updates = { ...prev };
        // Simulate activity updates for assigned agents
        accounts.forEach(account => {
          if (account.assigned_agent) {
            const activityKey = `${account.id}_${account.assigned_agent.agent_id}`;
            const lastActivity = updates[activityKey] || {
              status: account.assigned_agent.status,
              last_contact_attempt: Date.now() - Math.random() * 3600000, // Random time within last hour
              progress: Math.floor(Math.random() * 100),
              next_action: 'Scheduled outreach',
              success_rate: 75 + Math.random() * 20
            };
            
            // Simulate status changes
            if (Math.random() < 0.1) { // 10% chance of status change
              const statuses = ['active', 'paused', 'completed'];
              lastActivity.status = statuses[Math.floor(Math.random() * statuses.length)];
            }
            
            // Update progress occasionally
            if (Math.random() < 0.3) {
              lastActivity.progress = Math.min(100, lastActivity.progress + Math.floor(Math.random() * 10));
            }
            
            updates[activityKey] = lastActivity;
          }
        });
        return updates;
      });
      setLastActivityUpdate(Date.now());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [accounts]);


  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'calendly-badge-success';
      case 'at risk': return 'calendly-badge-danger';
      case 'churned': return 'calendly-badge-danger';
      case 'onboarding': return 'calendly-badge-info';
      default: return 'calendly-badge-info';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'enterprise': return 'calendly-badge-success';
      case 'growth': return 'calendly-badge-warning';
      case 'starter': return 'calendly-badge-info';
      default: return 'calendly-badge-info';
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = !searchQuery || 
      account.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.account_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.primary_contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.csm.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTier = tierFilter === 'all' || account.account_tier === tierFilter;
    const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
    
    return matchesSearch && matchesTier && matchesStatus;
  });

  const handleAccountClick = (accountId: string) => {
    console.log('View account:', accountId);
  };

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAccounts.length === filteredAccounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(filteredAccounts.map(account => account.id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (action === 'assign_agent') {
      setShowAgentWizard(true);
      setWizardStep('select');
    } else {
      console.log(`Bulk action ${action} for accounts:`, selectedAccounts);
      setSelectedAccounts([]);
    }
  };

  const handleAgentAssignment = () => {
    if (!selectedAgent || !agentConfig.purpose) return;
    
    const agent = availableAgents.find(a => a.id === selectedAgent);
    if (!agent) return;

    // Create agent assignment data
    const agentAssignmentData = {
      agent_id: selectedAgent,
      agent_name: agent.name,
      agent_type: agent.type,
      assigned_date: new Date().toISOString(),
      purpose: agentConfig.purpose,
      status: 'active' as const,
      next_contact: getNextContactDate(agentConfig.outreach_frequency),
      configuration: {
        outreach_frequency: agentConfig.outreach_frequency,
        max_attempts: agentConfig.max_attempts,
        contact_methods: agentConfig.contact_methods,
        tone: agentConfig.tone,
        message_style: agentConfig.message_style,
        custom_message: agentConfig.custom_message,
        ai_suggestions_enabled: agentConfig.ai_suggestions_enabled
      }
    };

    // Update accounts with agent assignments
    const updatedAccounts = accounts.map(account => {
      if (selectedAccounts.includes(account.id)) {
        return {
          ...account,
          assigned_agent: agentAssignmentData
        };
      }
      return account;
    });

    setAccounts(updatedAccounts);

    // Store agent assignment in localStorage for persistence
    const existingAgentData = JSON.parse(localStorage.getItem('activeAgents') || '[]');
    const agentExists = existingAgentData.find((a: any) => a.id === selectedAgent && a.type === agent.type);
    
    if (!agentExists) {
      // Create new agent entry
      const newAgentEntry = {
        id: selectedAgent,
        name: agent.name,
        type: agent.type,
        description: agent.description,
        status: 'active',
        created_at: new Date().toISOString(),
        assigned_accounts: selectedAccounts.length,
        total_contacts: 0,
        success_rate: 0,
        last_activity: new Date().toISOString(),
        configuration: agentAssignmentData.configuration
      };
      existingAgentData.push(newAgentEntry);
    } else {
      // Update existing agent
      const agentIndex = existingAgentData.findIndex((a: any) => a.id === selectedAgent);
      existingAgentData[agentIndex] = {
        ...existingAgentData[agentIndex],
        status: 'active',
        assigned_accounts: (existingAgentData[agentIndex].assigned_accounts || 0) + selectedAccounts.length,
        last_activity: new Date().toISOString(),
        configuration: agentAssignmentData.configuration
      };
    }
    
    localStorage.setItem('activeAgents', JSON.stringify(existingAgentData));

    console.log('Agent assignment completed:', {
      accounts: selectedAccounts,
      agent: agent.name,
      config: agentConfig,
      agentData: agentAssignmentData
    });

    // Show success feedback
    alert(`Successfully assigned ${agent.name} to ${selectedAccounts.length} account${selectedAccounts.length !== 1 ? 's' : ''}!`);
    
    // Clear selections and close wizard
    setSelectedAccounts([]);
    closeWizard();
  };

  const getNextContactDate = (frequency: string): string => {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case '3days':
        now.setDate(now.getDate() + 3);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'biweekly':
        now.setDate(now.getDate() + 14);
        break;
      default:
        now.setDate(now.getDate() + 3);
    }
    return now.toISOString();
  };

  const closeWizard = () => {
    setShowAgentWizard(false);
    setWizardStep('select');
    setSelectedAccounts([]);
    setSelectedAgent(null);
    setShowManualConfig(false);
    setAiGenerated(false);
    setAgentConfig({
      purpose: '',
      outreach_frequency: '3days',
      max_attempts: 5,
      contact_methods: ['email'],
      tone: 'professional',
      message_style: 'concise',
      custom_message: '',
      ai_suggestions_enabled: true
    });
  };

  const handleNext = () => {
    if (wizardStep === 'select' && selectedAgent) {
      setWizardStep('configure');
    } else if (wizardStep === 'configure' && agentConfig.purpose) {
      setWizardStep('confirm');
    }
  };

  const handleBack = () => {
    if (wizardStep === 'configure') {
      setWizardStep('select');
    } else if (wizardStep === 'confirm') {
      setWizardStep('configure');
    }
  };

  // Mock available agents
  const availableAgents = [
    {
      id: 'agent-renewal-001',
      name: 'Renewal Outreach Agent',
      type: 'Renewal Specialist',
      description: 'Proactively contacts accounts approaching renewal dates'
    },
    {
      id: 'agent-health-001', 
      name: 'Health Recovery Agent',
      type: 'Health Specialist',
      description: 'Engages with at-risk accounts to improve health scores'
    },
    {
      id: 'agent-onboard-001',
      name: 'Onboarding Agent', 
      type: 'Onboarding Specialist',
      description: 'Guides new customers through product adoption'
    },
    {
      id: 'agent-expansion-001',
      name: 'Expansion Agent',
      type: 'Growth Specialist', 
      description: 'Identifies and pursues expansion opportunities'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#4285f4' }}></div>
                <p className="calendly-body mt-4">Loading customer data...</p>
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
          <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
            <div>
              <h1 className="calendly-h1">Accounts</h1>
              <p className="calendly-body">Account management and workflow assignment from HubSpot sync</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="calendly-btn-secondary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>


          {/* Filters and Search */}
          <div className="calendly-card" style={{ marginBottom: '24px' }}>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#718096' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search accounts, CSMs, or account IDs..."
                    className="w-full pl-12 pr-4 py-3 calendly-body-sm transition-all duration-200"
                    style={{ 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: 'white'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4285f4';
                      e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                  style={{ border: '1px solid #e2e8f0', background: 'white' }}
                >
                  <option value="all">All Tiers</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="Growth">Growth</option>
                  <option value="Starter">Starter</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                  style={{ border: '1px solid #e2e8f0', background: 'white' }}
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Churned">Churned</option>
                </select>

              </div>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {showBulkActions && (
            <div className="calendly-card" style={{ marginBottom: '24px', background: '#f1f5f9' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="calendly-body font-medium">
                    {selectedAccounts.length} account{selectedAccounts.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center space-x-3 relative">
                  <button 
                    onClick={() => handleBulkAction('assign_agent')}
                    className="calendly-btn-primary flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Assign to Agent</span>
                  </button>
                  <button 
                    onClick={() => setSelectedAccounts([])}
                    className="p-2 rounded transition-colors"
                    style={{ color: '#718096' }}
                  >
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Inline Agent Assignment Interface - Positioned above table */}
          {showAgentWizard && (
            <div className="calendly-card" style={{ marginBottom: '24px', background: '#f8fafc', border: '2px solid #4285f4' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                <div className="flex items-center space-x-3">
                  <Bot className="w-6 h-6" style={{ color: '#4285f4' }} />
                  <div>
                    <h3 className="calendly-h3" style={{ marginBottom: '2px' }}>
                      Assign {selectedAccounts.length} Account{selectedAccounts.length !== 1 ? 's' : ''} to Agent
                    </h3>
                    <p className="calendly-body-sm">
                      Configure agent workflow for selected accounts
                    </p>
                  </div>
                </div>
                <button 
                  onClick={closeWizard}
                  className="p-2 rounded transition-colors text-gray-400 hover:text-gray-600 hover:bg-white"
                >
                  <span className="text-lg">×</span>
                </button>
              </div>


              {/* Step Content */}
              <div style={{ marginBottom: '24px' }}>
                {/* Step 1: Agent Selection */}
                {wizardStep === 'select' && (
                  <div>
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Choose Your AI Agent Type</h4>
                      <p className="text-sm text-gray-600">Select the specialist agent that best matches your outreach goals</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableAgents.map((agent) => {
                        const isSelected = selectedAgent === agent.id;
                        const iconConfig = {
                          renewal: { icon: Target, bg: 'bg-blue-500', color: 'text-white', badge: 'bg-blue-100 text-blue-800' },
                          health: { icon: Activity, bg: 'bg-red-500', color: 'text-white', badge: 'bg-red-100 text-red-800' },
                          onboarding: { icon: Users, bg: 'bg-green-500', color: 'text-white', badge: 'bg-green-100 text-green-800' },
                          expansion: { icon: TrendingUp, bg: 'bg-yellow-500', color: 'text-white', badge: 'bg-yellow-100 text-yellow-800' }
                        }[agent.type] || { icon: Bot, bg: 'bg-gray-500', color: 'text-white', badge: 'bg-gray-100 text-gray-800' };
                        const IconComponent = iconConfig.icon;
                        
                        return (
                          <button
                            key={agent.id}
                            onClick={() => setSelectedAgent(agent.id)}
                            className={`relative p-4 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-md group ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                            }`}
                          >
                            {/* Selection Indicator */}
                            {isSelected && (
                              <div className="absolute top-3 right-3">
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            )}
                            
                            {/* Agent Header */}
                            <div className="flex items-start space-x-3 mb-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconConfig.bg} group-hover:scale-105 transition-transform duration-200`}>
                                <IconComponent className={`w-5 h-5 ${iconConfig.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-gray-900 text-sm mb-1">{agent.name}</h5>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${iconConfig.badge}`}>
                                  {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)} Specialist
                                </span>
                              </div>
                            </div>
                            
                            {/* Agent Description */}
                            <p className="text-xs text-gray-600">
                              {agent.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 2: Configuration */}
                {wizardStep === 'configure' && selectedAgent && (
                  <div>
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Configure Your AI Agent</h4>
                      <p className="text-sm text-gray-600">Let AI optimize your agent settings, then customize as needed</p>
                    </div>

                    {/* AI Generate CTA */}
                    {!aiGenerated && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900 mb-1">Generate Optimal Configuration</h5>
                              <p className="text-sm text-gray-600">
                                AI will analyze your accounts and create the perfect setup.
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setAiGenerated(true);
                              // Simulate AI generation with optimal defaults
                              setAgentConfig({
                                ...agentConfig,
                                purpose: selectedAgent === 'agent-renewal-001' ? 'Schedule renewal discussion and address any concerns' :
                                        selectedAgent === 'agent-health-001' ? 'Improve account engagement and resolve usage issues' :
                                        selectedAgent === 'agent-onboard-001' ? 'Guide through setup and ensure successful adoption' :
                                        'Identify expansion opportunities and present solutions',
                                tone: selectedAgent === 'agent-health-001' ? 'friendly' : 'professional',
                                message_style: selectedAgent === 'agent-onboard-001' ? 'detailed' : 'personalized'
                              });
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 whitespace-nowrap text-sm"
                          >
                            <Bot className="w-4 h-4" />
                            <span>Generate with AI</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* AI Generated Summary with Email Preview */}
                    {aiGenerated && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-3 mb-4">
                          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-green-900 mb-1">AI Configuration Complete</h5>
                            <p className="text-sm text-green-700 mb-2">
                              Optimized for {agentConfig.tone} tone with {agentConfig.message_style} messaging, targeting {selectedAccounts.length} account{selectedAccounts.length !== 1 ? 's' : ''}.
                            </p>
                            <div className="text-xs text-green-600">
                              <strong>Purpose:</strong> {agentConfig.purpose}
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setAiGenerated(false);
                              setAgentConfig({
                                ...agentConfig,
                                purpose: selectedAgent === 'agent-renewal-001' ? 'Schedule renewal discussion and address any concerns' :
                                        selectedAgent === 'agent-health-001' ? 'Improve account engagement and resolve usage issues' :
                                        selectedAgent === 'agent-onboard-001' ? 'Guide through setup and ensure successful adoption' :
                                        'Identify expansion opportunities and present solutions',
                                tone: selectedAgent === 'agent-health-001' ? 'friendly' : 'professional',
                                message_style: selectedAgent === 'agent-onboard-001' ? 'detailed' : 'personalized'
                              });
                              setAiGenerated(true);
                            }}
                            className="text-xs bg-white border border-green-300 text-green-700 px-3 py-1 rounded hover:bg-green-50 transition-colors"
                          >
                            🔄 Regenerate with AI
                          </button>
                        </div>
                        
                        {/* Email Preview */}
                        <div className="bg-white border border-green-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium text-green-800">AI-Generated Email Preview</span>
                          </div>
                          <div className="text-xs text-gray-700 space-y-1">
                            <div><strong>Subject:</strong> {selectedAgent === 'agent-renewal-001' ? 'Your Upcoming Renewal - Let\'s Connect' :
                              selectedAgent === 'agent-health-001' ? 'Optimizing Your Platform Experience' :
                              selectedAgent === 'agent-onboard-001' ? 'Getting the Most from Your Setup' :
                              'Exploring Growth Opportunities Together'}</div>
                            <div className="pt-2 text-gray-600 italic">
                              "Hi [Contact Name],<br/><br/>
                              {selectedAgent === 'agent-renewal-001' && agentConfig.tone === 'professional' ? 
                                'I hope this message finds you well. As we approach your renewal date, I wanted to reach out to discuss your experience and ensure we\'re delivering maximum value for your organization.' :
                              selectedAgent === 'agent-health-001' && agentConfig.tone === 'friendly' ? 
                                'I hope you\'re doing well! I\'ve been reviewing your account and wanted to reach out to see how we can help optimize your experience with our platform.' :
                              selectedAgent === 'agent-onboard-001' ? 
                                'Welcome aboard! I\'m excited to help you get the most out of our platform. I\'ve prepared some resources to ensure your team has a smooth setup experience.' :
                                'I hope you\'re seeing great results with our platform! I\'ve been analyzing your usage patterns and believe there are some exciting opportunities to drive even more value.'}
                              <br/><br/>
                              Best regards,<br/>
                              [Agent Name]"
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Manual Configuration Toggle */}
                    <div className="flex items-center justify-center mb-4">
                      <button 
                        onClick={() => setShowManualConfig(!showManualConfig)}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1 transition-colors"
                      >
                        <span>{showManualConfig ? 'Hide' : 'Show'} manual configuration</span>
                        <svg className={`w-4 h-4 transition-transform ${showManualConfig ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Manual Configuration - Collapsible */}
                    {showManualConfig && (
                      <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Bot className="w-4 h-4" style={{ color: '#4285f4' }} />
                          <h5 className="text-sm font-medium text-gray-900">Manual Configuration</h5>
                        </div>
                        
                        {/* Core Settings */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose & Objective</label>
                              <input
                                type="text"
                                value={agentConfig.purpose}
                                onChange={(e) => setAgentConfig({...agentConfig, purpose: e.target.value})}
                                placeholder="e.g., Schedule renewal discussion"
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Outreach Frequency</label>
                              <select
                                value={agentConfig.outreach_frequency}
                                onChange={(e) => setAgentConfig({...agentConfig, outreach_frequency: e.target.value as any})}
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="daily">Daily</option>
                                <option value="3days">Every 3 Days</option>
                                <option value="weekly">Weekly</option>
                                <option value="biweekly">Bi-weekly</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
                              <input
                                type="number"
                                value={agentConfig.max_attempts}
                                onChange={(e) => setAgentConfig({...agentConfig, max_attempts: parseInt(e.target.value)})}
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                min="1"
                                max="20"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Methods</label>
                              <div className="flex flex-wrap gap-2">
                                {['email', 'phone', 'linkedin'].map((method) => (
                                  <label key={method} className="flex items-center space-x-1">
                                    <input
                                      type="checkbox"
                                      checked={agentConfig.contact_methods.includes(method as any)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setAgentConfig({
                                            ...agentConfig, 
                                            contact_methods: [...agentConfig.contact_methods, method as any]
                                          });
                                        } else {
                                          setAgentConfig({
                                            ...agentConfig,
                                            contact_methods: agentConfig.contact_methods.filter(m => m !== method)
                                          });
                                        }
                                      }}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-xs capitalize">{method}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* AI Communication Settings */}
                        <div className="border-t pt-3">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Tone & Voice</label>
                              <div className="space-y-1">
                                {[
                                  { value: 'professional', label: 'Professional' },
                                  { value: 'friendly', label: 'Friendly' },
                                  { value: 'casual', label: 'Casual' }
                                ].map((tone) => (
                                  <label key={tone.value} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="tone"
                                      value={tone.value}
                                      checked={agentConfig.tone === tone.value}
                                      onChange={(e) => setAgentConfig({...agentConfig, tone: e.target.value as any})}
                                      className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-900">{tone.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Message Style</label>
                              <div className="space-y-1">
                                {[
                                  { value: 'concise', label: 'Concise' },
                                  { value: 'detailed', label: 'Detailed' },
                                  { value: 'personalized', label: 'Personalized' }
                                ].map((style) => (
                                  <label key={style.value} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="message_style"
                                      value={style.value}
                                      checked={agentConfig.message_style === style.value}
                                      onChange={(e) => setAgentConfig({...agentConfig, message_style: e.target.value as any})}
                                      className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-900">{style.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {wizardStep === 'confirm' && (
                  <div>
                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Review & Launch Agent</h4>
                      <p className="text-sm text-gray-600">Review your configuration and launch your AI agent</p>
                    </div>

                    {/* Agent Summary Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                          {selectedAgent === 'agent-renewal-001' && <Target className="w-6 h-6 text-white" />}
                          {selectedAgent === 'agent-health-001' && <Activity className="w-6 h-6 text-white" />}
                          {selectedAgent === 'agent-onboard-001' && <Users className="w-6 h-6 text-white" />}
                          {selectedAgent === 'agent-expansion-001' && <TrendingUp className="w-6 h-6 text-white" />}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">
                            {availableAgents.find(a => a.id === selectedAgent)?.name}
                          </h5>
                          <p className="text-sm text-gray-600 mb-3">{agentConfig.purpose}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Every {agentConfig.outreach_frequency === '3days' ? '3 days' : agentConfig.outreach_frequency}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{selectedAccounts.length} account{selectedAccounts.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Bot className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 capitalize">{agentConfig.tone} tone</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Configuration Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h6 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Settings className="w-4 h-4 mr-2 text-gray-500" />
                          Configuration
                        </h6>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Max Attempts:</span>
                            <span className="font-medium">{agentConfig.max_attempts}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Contact Methods:</span>
                            <span className="font-medium capitalize">{agentConfig.contact_methods.join(', ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Message Style:</span>
                            <span className="font-medium capitalize">{agentConfig.message_style}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h6 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Activity className="w-4 h-4 mr-2 text-gray-500" />
                          Expected Results
                        </h6>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estimated Reach:</span>
                            <span className="font-medium text-blue-600">{selectedAccounts.length * agentConfig.max_attempts} contacts</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Timeline:</span>
                            <span className="font-medium">{Math.ceil(agentConfig.max_attempts * (String(agentConfig.outreach_frequency) === 'daily' ? 1 : String(agentConfig.outreach_frequency) === '3days' ? 3 : 7))} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Success Rate:</span>
                            <span className="font-medium text-green-600">~85-92%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Launch Confirmation */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <svg className="w-5 h-5 text-amber-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-amber-800">Ready to Launch</p>
                          <p className="text-sm text-amber-700">
                            Your agent will begin outreach immediately after confirmation. You can monitor progress and make adjustments from the Agents dashboard.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={wizardStep === 'select' ? closeWizard : handleBack}
                  className="calendly-btn-secondary flex items-center space-x-2"
                >
                  <span>{wizardStep === 'select' ? 'Cancel' : 'Back'}</span>
                </button>
                
                <button
                  onClick={wizardStep === 'confirm' ? handleAgentAssignment : handleNext}
                  disabled={
                    (wizardStep === 'select' && !selectedAgent) ||
                    (wizardStep === 'configure' && !agentConfig.purpose)
                  }
                  className="calendly-btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{wizardStep === 'confirm' ? 'Assign Accounts' : 'Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Accounts Table */}
          <div className="calendly-card" style={{ padding: 0 }}>
            <div className="overflow-x-auto">
              <table className="calendly-table">
                <thead>
                  <tr>
                    <th className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedAccounts.length === filteredAccounts.length && filteredAccounts.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th>Account</th>
                    <th>ARR</th>
                    <th>CSM</th>
                    <th>Status</th>
                    <th>Health Score</th>
                    <th>Agent Assignment</th>
                    <th>Renewal Date</th>
                    <th>Primary Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account) => (
                    <tr key={account.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleAccountClick(account.id)}>
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedAccounts.includes(account.id)}
                          onChange={() => handleAccountSelect(account.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td>
                        <div>
                          <div className="font-medium">{account.company_name}</div>
                          <div className="text-sm text-gray-600">
                            {account.account_id} • {account.account_tier}
                          </div>
                        </div>
                      </td>
                      <td className="font-medium text-green-600">
                        ${account.arr.toLocaleString()}
                      </td>
                      <td>
                        <div>
                          <div className="font-medium">{account.csm}</div>
                          {account.cgm && (
                            <div className="text-sm text-gray-600">CGM: {account.cgm}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`calendly-badge ${getStatusColor(account.status)}`}>
                          {account.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{account.health_score}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                account.health_score >= 80 ? 'bg-green-500' :
                                account.health_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${account.health_score}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {account.assigned_agent ? (
                          <div>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${
                                agentActivities[`${account.id}_${account.assigned_agent.agent_id}`]?.status === 'active' ? 'bg-green-500 animate-pulse' :
                                agentActivities[`${account.id}_${account.assigned_agent.agent_id}`]?.status === 'paused' ? 'bg-yellow-500' :
                                'bg-gray-500'
                              }`}></div>
                              <span className="font-medium text-sm">{account.assigned_agent.agent_name}</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {account.assigned_agent.purpose}
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="text-gray-500">
                                Progress: {agentActivities[`${account.id}_${account.assigned_agent.agent_id}`]?.progress || 0}%
                              </span>
                              <div className="w-12 bg-gray-200 rounded-full h-1">
                                <div 
                                  className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${agentActivities[`${account.id}_${account.assigned_agent.agent_id}`]?.progress || 0}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              Next: {agentActivities[`${account.id}_${account.assigned_agent.agent_id}`]?.next_action || 'Scheduled outreach'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No agent assigned</span>
                        )}
                      </td>
                      <td className="text-sm">
                        {new Date(account.renewal_date).toLocaleDateString()}
                      </td>
                      <td>
                        <div>
                          <div className="font-medium">{account.primary_contact}</div>
                          <a 
                            href={`mailto:${account.primary_email}`} 
                            className="text-sm text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {account.primary_email}
                          </a>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-1">
                          {account.support_url && (
                            <a
                              href={account.support_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded transition-colors"
                              style={{ color: '#718096' }}
                              title="View Support"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAccountClick(account.id);
                            }}
                            className="p-1 rounded transition-colors"
                            style={{ color: '#718096' }}
                            title="View Account Details"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f1f5f9';
                              e.currentTarget.style.color = '#4285f4';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#718096';
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {filteredAccounts.length === 0 && (
            <div className="calendly-card text-center py-12">
              <Building className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
              <h3 className="calendly-h3" style={{ marginBottom: '8px' }}>No accounts found</h3>
              <p className="calendly-body" style={{ marginBottom: '24px' }}>
                {searchQuery || tierFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters' 
                  : 'HubSpot accounts will appear here after sync'}
              </p>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}