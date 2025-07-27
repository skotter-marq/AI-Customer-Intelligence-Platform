'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bot, GitBranch, Settings, Users, Calendar, Zap, Plus, X, CheckCircle, ArrowRight, ChevronDown, Search } from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  input_parameters: {
    name: string;
    type: 'text' | 'number' | 'select' | 'boolean' | 'date';
    required: boolean;
    options?: string[];
    description: string;
  }[];
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'date';
  required: boolean;
  options?: string[];
  defaultValue?: string;
  description?: string;
  placeholder?: string;
}

export default function CreateAgentPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [availableWorkflows, setAvailableWorkflows] = useState<Workflow[]>([]);
  const [workflowSelected, setWorkflowSelected] = useState(false);
  const [parametersConfigured, setParametersConfigured] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Searchable dropdown states
  const [dropdownStates, setDropdownStates] = useState<Record<string, {
    isOpen: boolean;
    searchTerm: string;
  }>>({});
  
  // Validation states
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'error' | 'success' | 'warning';
  }>({ show: false, message: '', type: 'error' });
  
  const [highlightedFields, setHighlightedFields] = useState<Set<string>>(new Set());
  
  // Agent configuration
  const [agentConfig, setAgentConfig] = useState({
    name: '',
    description: '',
    workflow_id: '',
    schedule: {
      frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
      time: '09:00'
    },
    parameters: {} as Record<string, any>
  });

  useEffect(() => {
    loadAvailableWorkflows();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside any searchable dropdown
      if (!target.closest('.searchable-dropdown')) {
        setDropdownStates(prev => {
          const newState = { ...prev };
          let hasOpenDropdown = false;
          
          // Close all open dropdowns and clear search terms
          Object.keys(newState).forEach(key => {
            if (newState[key]?.isOpen) {
              hasOpenDropdown = true;
              newState[key] = { 
                isOpen: false, 
                searchTerm: '' // Clear search when closing
              };
            }
          });
          
          // Only update state if there were open dropdowns to avoid unnecessary re-renders
          return hasOpenDropdown ? newState : prev;
        });
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownStates(prev => {
          const newState = { ...prev };
          let hasOpenDropdown = false;
          
          Object.keys(newState).forEach(key => {
            if (newState[key]?.isOpen) {
              hasOpenDropdown = true;
              newState[key] = { 
                isOpen: false, 
                searchTerm: '' 
              };
            }
          });
          
          return hasOpenDropdown ? newState : prev;
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const loadAvailableWorkflows = async () => {
    // Mock workflow data (would come from n8n API)
    const mockWorkflows: Workflow[] = [
      {
        id: 'wf-001',
        name: 'Customer Health Analysis Pipeline',
        description: 'Comprehensive customer health scoring with AI-powered insights',
        category: 'customer-health',
        input_parameters: [
          {
            name: 'customerSegment',
            type: 'select',
            required: true,
            options: ['Enterprise', 'Growth', 'Startup', 'All Segments'],
            description: 'Target customer segment for health analysis'
          },
          {
            name: 'healthThreshold',
            type: 'number',
            required: false,
            description: 'Minimum health score threshold (0-100). Customers below this score will be flagged for attention.'
          },
          {
            name: 'analysisDate',
            type: 'date',
            required: true,
            description: 'Start date for the health analysis period'
          },
          {
            name: 'includeActionPlans',
            type: 'boolean',
            required: false,
            description: 'Generate AI-powered action recommendations for at-risk customers'
          },
          {
            name: 'contactEmail',
            type: 'text',
            required: true,
            description: 'Email address to receive the health analysis report'
          }
        ]
      },
      {
        id: 'wf-002',
        name: 'Advanced Lead Scoring Engine',
        description: 'Multi-factor lead scoring with behavioral analysis and predictive modeling',
        category: 'lead-management',
        input_parameters: [
          {
            name: 'scoringModel',
            type: 'select',
            required: true,
            options: ['Standard Scoring', 'AI-Enhanced Scoring', 'Custom Weighted Model', 'Predictive Scoring'],
            description: 'Choose the lead scoring methodology to apply'
          },
          {
            name: 'leadSources',
            type: 'select',
            required: true,
            options: ['Website Forms', 'Social Media', 'Email Campaigns', 'Referrals', 'All Sources'],
            description: 'Lead sources to include in scoring analysis'
          },
          {
            name: 'minimumScore',
            type: 'number',
            required: false,
            description: 'Minimum score threshold for lead qualification (0-100)'
          },
          {
            name: 'lookbackDays',
            type: 'number',
            required: true,
            description: 'Number of days to analyze for behavioral scoring (recommended: 30-90)'
          },
          {
            name: 'enableRealTimeUpdates',
            type: 'boolean',
            required: false,
            description: 'Continuously update lead scores as new data becomes available'
          },
          {
            name: 'excludeExistingCustomers',
            type: 'boolean',
            required: false,
            description: 'Exclude leads who are already customers from scoring'
          },
          {
            name: 'reportingFrequency',
            type: 'select',
            required: true,
            options: ['Daily', 'Weekly', 'Bi-weekly', 'Monthly'],
            description: 'How often should lead scoring reports be generated'
          },
          {
            name: 'customNotes',
            type: 'text',
            required: false,
            description: 'Additional notes or specific requirements for this scoring run'
          }
        ]
      },
      {
        id: 'wf-003',
        name: 'Competitive Intelligence Monitor',
        description: 'Automated competitor tracking with real-time alerts and market analysis',
        category: 'competitive-intel',
        input_parameters: [
          {
            name: 'primaryCompetitors',
            type: 'select',
            required: true,
            options: [
              'Salesforce', 'HubSpot', 'Pipedrive', 'Zendesk', 'Freshworks', 'Monday.com', 
              'Asana', 'ClickUp', 'Notion', 'Airtable', 'Trello', 'Jira', 'ServiceNow',
              'Workday', 'Oracle', 'SAP', 'Microsoft Dynamics', 'Zoho', 'Atlassian',
              'Slack', 'Teams', 'Discord', 'Zoom', 'WebEx', 'GoToMeeting', 'Adobe',
              'Canva', 'Figma', 'Sketch', 'InVision', 'Miro', 'Lucidchart', 'Dropbox',
              'Google Workspace', 'Box', 'OneDrive', 'AWS', 'Azure', 'All Major Competitors'
            ],
            description: 'Primary competitors to monitor for changes and updates'
          },
          {
            name: 'monitoringAreas',
            type: 'select',
            required: true,
            options: ['Pricing Changes', 'Product Updates', 'Marketing Campaigns', 'Hiring Patterns', 'All Areas'],
            description: 'Specific areas of competitive intelligence to track'
          },
          {
            name: 'alertThreshold',
            type: 'select',
            required: true,
            options: ['High Priority Only', 'Medium & High Priority', 'All Changes'],
            description: 'Level of changes that should trigger immediate alerts'
          },
          {
            name: 'analysisDepth',
            type: 'select',
            required: false,
            options: ['Basic Monitoring', 'Detailed Analysis', 'Comprehensive Report'],
            description: 'Depth of analysis to perform on detected changes'
          },
          {
            name: 'includeMetrics',
            type: 'boolean',
            required: false,
            description: 'Include quantitative metrics and trend analysis in reports'
          },
          {
            name: 'maxCompetitors',
            type: 'number',
            required: false,
            description: 'Maximum number of competitors to actively monitor (recommended: 3-8)'
          }
        ]
      }
    ];
    setAvailableWorkflows(mockWorkflows);
  };

  const handleWorkflowSelect = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setWorkflowSelected(true);
    
    // Initialize parameters with empty values
    const initialParameters: Record<string, any> = {};
    workflow.input_parameters.forEach(param => {
      initialParameters[param.name] = param.type === 'boolean' ? false : '';
    });
    
    setAgentConfig(prev => ({
      ...prev,
      workflow_id: workflow.id,
      name: '',
      description: '',
      parameters: initialParameters
    }));

    // Smooth scroll to parameters section
    setTimeout(() => {
      const parametersSection = document.getElementById('parameters-section');
      if (parametersSection) {
        parametersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleParametersComplete = () => {
    if (!validateRequiredFields()) {
      return; // Don't proceed if validation fails
    }
    
    setParametersConfigured(true);
    showToast('Configuration completed successfully!', 'success');
    
    // Smooth scroll to review section
    setTimeout(() => {
      const reviewSection = document.getElementById('review-section');
      if (reviewSection) {
        reviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };


  // Searchable dropdown helpers
  const toggleDropdown = (paramName: string) => {
    setDropdownStates(prev => {
      const newState = { ...prev };
      
      // Close all other dropdowns first
      Object.keys(newState).forEach(key => {
        if (key !== paramName && newState[key]?.isOpen) {
          newState[key] = {
            isOpen: false,
            searchTerm: ''
          };
        }
      });
      
      // Toggle the current dropdown
      newState[paramName] = {
        isOpen: !prev[paramName]?.isOpen,
        searchTerm: prev[paramName]?.searchTerm || ''
      };
      
      return newState;
    });
  };

  const updateSearchTerm = (paramName: string, searchTerm: string) => {
    setDropdownStates(prev => ({
      ...prev,
      [paramName]: {
        ...prev[paramName],
        searchTerm
      }
    }));
  };

  const selectOption = (paramName: string, value: string) => {
    setAgentConfig(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [paramName]: value
      }
    }));
    setDropdownStates(prev => ({
      ...prev,
      [paramName]: {
        isOpen: false,
        searchTerm: ''
      }
    }));
    
    // Remove field from highlighted errors when user fills it
    setHighlightedFields(prev => {
      const newSet = new Set(prev);
      newSet.delete(paramName);
      return newSet;
    });
  };

  // Validation helpers
  const showToast = (message: string, type: 'error' | 'success' | 'warning' = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const validateRequiredFields = () => {
    if (!selectedWorkflow) return true;
    
    const missingFields: string[] = [];
    
    // Validate agent name (required)
    if (!agentConfig.name || agentConfig.name.trim() === '') {
      missingFields.push('name');
    }
    
    // Validate workflow parameters
    const requiredParams = selectedWorkflow.input_parameters.filter(param => param.required);
    
    requiredParams.forEach(param => {
      const value = agentConfig.parameters[param.name];
      if (!value || value === '' || (typeof value === 'boolean' && !value)) {
        missingFields.push(param.name);
      }
    });
    
    if (missingFields.length > 0) {
      setHighlightedFields(new Set(missingFields));
      const fieldNames = missingFields.map(field => {
        if (field === 'name') return 'Agent Name';
        return field.charAt(0).toUpperCase() + field.slice(1);
      }).join(', ');
      
      showToast(
        `Please fill in the required field${missingFields.length > 1 ? 's' : ''}: ${fieldNames}`, 
        'error'
      );
      
      // Scroll to first missing field
      setTimeout(() => {
        const firstMissingElement = document.querySelector(`[data-field="${missingFields[0]}"]`);
        if (firstMissingElement) {
          firstMissingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      return false;
    }
    
    setHighlightedFields(new Set());
    return true;
  };


  const renderWorkflowSelection = () => (
    <div className="calendly-card-static" style={{ marginBottom: '24px' }}>
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="calendly-h2" style={{ marginBottom: '8px' }}>Select Workflow</h2>
            <p className="calendly-body">Choose the n8n workflow your AI agent will execute automatically</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                onClick={() => handleWorkflowSelect(workflow)}
                className={`p-6 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedWorkflow?.id === workflow.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ background: selectedWorkflow?.id === workflow.id ? '#f0f8ff' : 'white' }}
              >
                <div className="flex items-start space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ 
                      background: selectedWorkflow?.id === workflow.id ? '#4285f4' : '#f1f5f9'
                    }}
                  >
                    <GitBranch 
                      className="w-5 h-5" 
                      style={{ 
                        color: selectedWorkflow?.id === workflow.id ? 'white' : '#64748b'
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                    <p className="calendly-body-sm mt-1" style={{ color: '#64748b' }}>
                      {workflow.description}
                    </p>
                    <div className="mt-3">
                      <span 
                        className="inline-block px-2 py-1 rounded text-xs"
                        style={{ 
                          background: '#f1f5f9',
                          color: '#64748b'
                        }}
                      >
                        {workflow.input_parameters.length} parameters
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedWorkflow && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {selectedWorkflow.name} selected
                  </p>
                  <p className="text-xs text-green-600">
                    Ready to configure parameters
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );


  const renderParametersConfiguration = () => (
    <div id="parameters-section" className="calendly-card-static" style={{ marginBottom: '24px' }}>
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="calendly-h2" style={{ marginBottom: '8px' }}>Configure Parameters</h2>
            <p className="calendly-body">Set the values that will be used each time the workflow runs automatically</p>
          </div>

          <div className="border rounded-lg" style={{ background: 'white' }}>
            <div className="p-6">
              {/* Agent Name */}
              <div className="mb-12 pb-8 border-b border-gray-200">
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Agent Details</h3>
                  <p className="calendly-body-sm" style={{ color: '#64748b' }}>Customize your agent's identity</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Agent Name
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <span 
                        className="text-xs px-2 py-1 rounded"
                        style={{ 
                          background: '#f1f5f9',
                          color: '#64748b'
                        }}
                      >
                        text
                      </span>
                    </div>
                    <div className="relative group">
                      <input
                        type="text"
                        value={agentConfig.name || ''}
                        onChange={(e) => {
                          setAgentConfig(prev => ({ ...prev, name: e.target.value }));
                          if (highlightedFields.has('name')) {
                            setHighlightedFields(prev => {
                              const newSet = new Set(prev);
                              newSet.delete('name');
                              return newSet;
                            });
                          }
                        }}
                        data-field="name"
                        className={`w-full px-4 py-3 border-2 rounded-lg group-hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 ${
                          highlightedFields.has('name') ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter a custom name for your agent..."
                        maxLength={100}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      Give your agent a memorable name that describes its purpose
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Description
                      </label>
                      <span 
                        className="text-xs px-2 py-1 rounded"
                        style={{ 
                          background: '#f1f5f9',
                          color: '#64748b'
                        }}
                      >
                        text
                      </span>
                    </div>
                    <div className="relative group">
                      <input
                        type="text"
                        value={agentConfig.description || ''}
                        onChange={(e) => {
                          setAgentConfig(prev => ({ ...prev, description: e.target.value }));
                          if (highlightedFields.has('description')) {
                            setHighlightedFields(prev => {
                              const newSet = new Set(prev);
                              newSet.delete('description');
                              return newSet;
                            });
                          }
                        }}
                        data-field="description"
                        className={`w-full px-4 py-3 border-2 rounded-lg group-hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 ${
                          highlightedFields.has('description') ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Brief description of what this agent does..."
                        maxLength={200}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      Optional description to help you identify this agent later
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Workflow Parameters */}
              <div className="mb-12 pb-8 border-b border-gray-200">
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Workflow Parameters</h3>
                  <p className="calendly-body-sm" style={{ color: '#64748b' }}>Configure the specific settings for your selected workflow</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {selectedWorkflow?.input_parameters.map((param, index) => (
                  <div key={param.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        {param.name.charAt(0).toUpperCase() + param.name.slice(1)}
                        {param.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <span 
                        className="text-xs px-2 py-1 rounded"
                        style={{ 
                          background: '#f1f5f9',
                          color: '#64748b'
                        }}
                      >
                        {param.type}
                      </span>
                    </div>
                    
                    {param.description && (
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {param.description}
                      </p>
                    )}
                    
                    <div>
                      {param.type === 'select' && param.options ? (
                        // Universal Searchable Dropdown for All Select Fields
                        <div className="relative searchable-dropdown">
                          {!dropdownStates[param.name]?.isOpen ? (
                            // Closed state - show selected value or placeholder
                            <button
                              type="button"
                              onClick={() => toggleDropdown(param.name)}
                              data-field={param.name}
                              className={`w-full px-4 py-3 border-2 rounded-lg text-left hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 ${
                                highlightedFields.has(param.name) ? 'border-red-500' : 'border-gray-300'
                              }`}
                              style={{
                                background: agentConfig.parameters[param.name] ? 'white' : '#fafbfc'
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className={agentConfig.parameters[param.name] ? 'text-gray-900' : 'text-gray-500'}>
                                  {agentConfig.parameters[param.name] || (param.required ? 'Search and select...' : 'Search and select (optional)')}
                                </span>
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              </div>
                            </button>
                          ) : (
                            // Open state - show search input
                            <div className="relative">
                              <input
                                type="text"
                                placeholder={param.options.length > 10 ? "Type to search options..." : "Type to filter options..."}
                                value={dropdownStates[param.name]?.searchTerm || ''}
                                onChange={(e) => updateSearchTerm(param.name, e.target.value)}
                                className="w-full px-4 py-3 pl-10 pr-12 border-2 border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                autoFocus
                              />
                              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                              <button
                                type="button"
                                onClick={() => toggleDropdown(param.name)}
                                className="absolute right-3 top-3 p-0.5 hover:bg-gray-100 rounded"
                              >
                                <ChevronDown className="w-5 h-5 text-gray-400 rotate-180" />
                              </button>
                            </div>
                          )}
                          
                          {dropdownStates[param.name]?.isOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-xl overflow-hidden">
                              {/* Options List */}
                              <div className={`overflow-y-auto ${param.options.length > 8 ? 'max-h-64' : 'max-h-auto'}`}>
                                {param.options
                                  .filter(option => 
                                    option.toLowerCase().includes((dropdownStates[param.name]?.searchTerm || '').toLowerCase())
                                  )
                                  .map((option, index) => (
                                    <button
                                      key={option}
                                      type="button"
                                      onClick={() => selectOption(param.name, option)}
                                      className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                        agentConfig.parameters[param.name] === option 
                                          ? 'bg-blue-100 text-blue-900 font-medium' 
                                          : 'text-gray-700'
                                      }`}
                                    >
                                      {option}
                                    </button>
                                  ))}
                                
                                {/* No results message */}
                                {param.options.filter(option => 
                                  option.toLowerCase().includes((dropdownStates[param.name]?.searchTerm || '').toLowerCase())
                                ).length === 0 && (
                                  <div className="px-4 py-6 text-gray-500 text-center">
                                    <div className="text-sm">No options found</div>
                                    <div className="text-xs mt-1">Try a different search term</div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Footer with count - only show for lists with more than 5 options */}
                              {param.options.length > 5 && param.options.filter(option => 
                                option.toLowerCase().includes((dropdownStates[param.name]?.searchTerm || '').toLowerCase())
                              ).length > 0 && (
                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                                  {param.options.filter(option => 
                                    option.toLowerCase().includes((dropdownStates[param.name]?.searchTerm || '').toLowerCase())
                                  ).length} of {param.options.length} options
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : param.type === 'boolean' ? (
                        // Enhanced Checkbox
                        <div className="flex items-start space-x-3 pt-1">
                          <div className="relative">
                            <input
                              type="checkbox"
                              id={`${param.name}-checkbox`}
                              checked={agentConfig.parameters[param.name] || false}
                              onChange={(e) => {
                                setAgentConfig(prev => ({
                                  ...prev,
                                  parameters: {
                                    ...prev.parameters,
                                    [param.name]: e.target.checked
                                  }
                                }));
                                if (highlightedFields.has(param.name)) {
                                  setHighlightedFields(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(param.name);
                                    return newSet;
                                  });
                                }
                              }}
                              data-field={param.name}
                              className={`w-4 h-4 text-blue-600 bg-white border-2 rounded focus:ring-blue-500 focus:ring-2 focus:ring-offset-0 cursor-pointer transition-all hover:border-blue-400 ${
                                highlightedFields.has(param.name) ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            {agentConfig.parameters[param.name] && (
                              <CheckCircle className="w-4 h-4 text-blue-600 absolute inset-0 pointer-events-none" />
                            )}
                          </div>
                          <div className="flex-1">
                            <label htmlFor={`${param.name}-checkbox`} className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                              {agentConfig.parameters[param.name] ? 'Enabled' : 'Disabled'}
                            </label>
                          </div>
                        </div>
                      ) : param.type === 'number' ? (
                        // Enhanced Number Input with Quick Actions
                        <div className="space-y-3">
                          <div className="relative group">
                            <input
                              type="number"
                              value={agentConfig.parameters[param.name] || ''}
                              onChange={(e) => {
                                setAgentConfig(prev => ({
                                  ...prev,
                                  parameters: {
                                    ...prev.parameters,
                                    [param.name]: e.target.value
                                  }
                                }));
                                if (highlightedFields.has(param.name)) {
                                  setHighlightedFields(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(param.name);
                                    return newSet;
                                  });
                                }
                              }}
                              data-field={param.name}
                              className={`w-full px-4 py-3 border-2 rounded-lg pr-16 group-hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 ${
                                highlightedFields.has(param.name) ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder={`Enter ${param.name.toLowerCase()}...`}
                              min={param.name.toLowerCase().includes('threshold') || param.name.toLowerCase().includes('score') ? "0" : 
                                   param.name.toLowerCase().includes('max') && param.name.toLowerCase().includes('competitor') ? "1" : "0"}
                              max={param.name.toLowerCase().includes('threshold') || param.name.toLowerCase().includes('score') ? "100" : 
                                   param.name.toLowerCase().includes('days') ? "365" :
                                   param.name.toLowerCase().includes('max') && param.name.toLowerCase().includes('competitor') ? "20" : undefined}
                              step={param.name.toLowerCase().includes('threshold') || param.name.toLowerCase().includes('score') ? "5" : "1"}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                              <span className="text-xs text-gray-400">
                                {param.name.toLowerCase().includes('threshold') || param.name.toLowerCase().includes('score') ? '0-100' : 
                                 param.name.toLowerCase().includes('days') ? 'days' : 
                                 param.name.toLowerCase().includes('max') && param.name.toLowerCase().includes('competitor') ? '1-20' : '#'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Quick Action Buttons */}
                          {(() => {
                            const getPresets = (fieldName) => {
                              const lowerFieldName = fieldName.toLowerCase();
                              if (lowerFieldName.includes('days')) {
                                return [
                                  { label: '1 day', value: 1 },
                                  { label: '7 days', value: 7 },
                                  { label: '14 days', value: 14 },
                                  { label: '30 days', value: 30 },
                                  { label: '60 days', value: 60 },
                                  { label: '90 days', value: 90 },
                                  { label: '180 days', value: 180 },
                                  { label: '365 days', value: 365 }
                                ];
                              } else if (lowerFieldName.includes('threshold') || lowerFieldName.includes('score')) {
                                return [
                                  { label: '0%', value: 0 },
                                  { label: '25%', value: 25 },
                                  { label: '50%', value: 50 },
                                  { label: '65%', value: 65 },
                                  { label: '75%', value: 75 },
                                  { label: '85%', value: 85 },
                                  { label: '95%', value: 95 },
                                  { label: '100%', value: 100 }
                                ];
                              } else if (lowerFieldName.includes('max') && lowerFieldName.includes('competitor')) {
                                return [
                                  { label: '1', value: 1 },
                                  { label: '3', value: 3 },
                                  { label: '5', value: 5 },
                                  { label: '8', value: 8 },
                                  { label: '10', value: 10 },
                                  { label: '15', value: 15 },
                                  { label: '20', value: 20 }
                                ];
                              }
                              return null;
                            };
                            
                            const presets = getPresets(param.name);
                            const currentValue = agentConfig.parameters[param.name];
                            
                            return presets ? (
                              <div>
                                <span className="text-xs text-gray-500 mb-2 block">Quick select:</span>
                                <div className="flex flex-wrap gap-2">
                                  {presets.map((preset) => (
                                    <button
                                      key={preset.value}
                                      type="button"
                                      onClick={() => setAgentConfig(prev => ({
                                        ...prev,
                                        parameters: {
                                          ...prev.parameters,
                                          [param.name]: preset.value.toString()
                                        }
                                      }))}
                                      className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                                        currentValue == preset.value
                                          ? 'bg-blue-500 text-white border-blue-500'
                                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                                      }`}
                                    >
                                      {preset.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      ) : param.type === 'date' ? (
                        // Enhanced Date Input
                        <div className="relative group">
                          <input
                            type="date"
                            value={agentConfig.parameters[param.name] || ''}
                            onChange={(e) => {
                              setAgentConfig(prev => ({
                                ...prev,
                                parameters: {
                                  ...prev.parameters,
                                  [param.name]: e.target.value
                                }
                              }));
                              if (highlightedFields.has(param.name)) {
                                setHighlightedFields(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(param.name);
                                  return newSet;
                                });
                              }
                            }}
                            data-field={param.name}
                            min="1900-01-01"
                            max="2099-12-31"
                            className={`w-full px-4 py-3 border-2 rounded-lg group-hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 ${
                              highlightedFields.has(param.name) ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                      ) : (
                        // Enhanced Text Input
                        <div className="relative group">
                          <input
                            type="text"
                            value={agentConfig.parameters[param.name] || ''}
                            onChange={(e) => {
                              setAgentConfig(prev => ({
                                ...prev,
                                parameters: {
                                  ...prev.parameters,
                                  [param.name]: e.target.value
                                }
                              }));
                              if (highlightedFields.has(param.name)) {
                                setHighlightedFields(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(param.name);
                                  return newSet;
                                });
                              }
                            }}
                            data-field={param.name}
                            className={`w-full px-4 py-3 border-2 rounded-lg group-hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 ${
                              highlightedFields.has(param.name) ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder={`Enter ${param.name.toLowerCase()}...`}
                            maxLength={param.name.includes('email') ? 254 : param.name.includes('notes') ? 500 : 100}
                          />
                          <div className="mt-1 flex justify-between">
                            <span className="text-xs text-gray-500">
                              {param.name.includes('email') ? 'Valid email address required' : 
                               param.name.includes('notes') ? 'Additional context or requirements' :
                               'Text input'}
                            </span>
                            {agentConfig.parameters[param.name] && (
                              <span className="text-xs text-gray-400">
                                {String(agentConfig.parameters[param.name]).length}/{param.name.includes('notes') ? 500 : 100}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Schedule Configuration */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Execution Schedule</h3>
                  <p className="calendly-body-sm" style={{ color: '#64748b' }}>When should your agent run automatically?</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Frequency
                      </label>
                      <span 
                        className="text-xs px-2 py-1 rounded"
                        style={{ 
                          background: '#f1f5f9',
                          color: '#64748b'
                        }}
                      >
                        select
                      </span>
                    </div>
                    <div className="relative searchable-dropdown">
                      <button
                        type="button"
                        onClick={() => toggleDropdown('frequency')}
                        data-field="frequency"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-left hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                        style={{
                          background: 'white'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900 capitalize">
                            {agentConfig.schedule.frequency}
                          </span>
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                      
                      {dropdownStates['frequency']?.isOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-xl overflow-hidden">
                          <div className="overflow-y-auto">
                            {['daily', 'weekly', 'monthly'].map((option) => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => {
                                  setAgentConfig(prev => ({
                                    ...prev,
                                    schedule: {
                                      ...prev.schedule,
                                      frequency: option as 'daily' | 'weekly' | 'monthly'
                                    }
                                  }));
                                  setDropdownStates(prev => ({
                                    ...prev,
                                    frequency: {
                                      isOpen: false,
                                      searchTerm: ''
                                    }
                                  }));
                                }}
                                className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                  agentConfig.schedule.frequency === option 
                                    ? 'bg-blue-100 text-blue-900 font-medium' 
                                    : 'text-gray-700'
                                } capitalize`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Time
                      </label>
                      <span 
                        className="text-xs px-2 py-1 rounded"
                        style={{ 
                          background: '#f1f5f9',
                          color: '#64748b'
                        }}
                      >
                        time
                      </span>
                    </div>
                    <div className="relative group">
                      <input
                        type="time"
                        value={agentConfig.schedule.time}
                        onChange={(e) => setAgentConfig(prev => ({
                          ...prev,
                          schedule: {
                            ...prev.schedule,
                            time: e.target.value
                          }
                        }))}
                        data-field="time"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg group-hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Schedule Summary */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800">
                        <strong>Your agent will run {agentConfig.schedule.frequency}</strong> at <strong>{agentConfig.schedule.time}</strong> with the parameters you configured.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleParametersComplete}
              className="calendly-btn-primary"
            >
              Review Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );


  const renderReview = () => (
    <div id="review-section" className="calendly-card-static" style={{ marginBottom: '24px' }}>
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="calendly-h2" style={{ marginBottom: '8px' }}>Review Agent Configuration</h2>
            <p className="calendly-body">Confirm your automated agent setup before creation</p>
          </div>

          <div className="border rounded-lg divide-y" style={{ background: 'white' }}>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900" style={{ marginBottom: '16px' }}>Basic Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="calendly-body" style={{ color: '#64748b' }}>Agent Name:</span>
                  <span className="calendly-body font-medium">{agentConfig.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="calendly-body" style={{ color: '#64748b' }}>Workflow:</span>
                  <span className="calendly-body font-medium">{selectedWorkflow?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="calendly-body" style={{ color: '#64748b' }}>Type:</span>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="calendly-body font-medium text-blue-600">Automated Agent</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-semibold text-gray-900" style={{ marginBottom: '16px' }}>Schedule</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="calendly-body" style={{ color: '#64748b' }}>Frequency:</span>
                  <span className="calendly-body font-medium capitalize">{agentConfig.schedule.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="calendly-body" style={{ color: '#64748b' }}>Time:</span>
                  <span className="calendly-body font-medium">{agentConfig.schedule.time}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-semibold text-gray-900" style={{ marginBottom: '16px' }}>Parameter Values</h3>
              <div className="space-y-3">
                {selectedWorkflow?.input_parameters.map((param) => (
                  <div key={param.name} className="flex justify-between">
                    <span className="calendly-body" style={{ color: '#64748b' }}>{param.name.charAt(0).toUpperCase() + param.name.slice(1)}:</span>
                    <span className="calendly-body font-medium">
                      {agentConfig.parameters[param.name] 
                        ? (typeof agentConfig.parameters[param.name] === 'boolean' 
                            ? (agentConfig.parameters[param.name] ? 'Yes' : 'No')
                            : agentConfig.parameters[param.name])
                        : <span style={{ color: '#9ca3af' }}>Not set</span>
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setIsCreating(true);
                // Simulate creation delay
                setTimeout(() => {
                  console.log('Creating automated agent:', agentConfig);
                  alert('Automated agent created successfully!');
                  window.location.href = '/agents';
                }, 1000);
              }}
              disabled={isCreating}
              className="calendly-btn-primary flex items-center space-x-2"
            >
              {isCreating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>{isCreating ? 'Creating...' : 'Create Agent'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform ${
            toast.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          } ${
            toast.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
            toast.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
            'bg-yellow-50 border-yellow-500 text-yellow-800'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {toast.type === 'error' && (
                  <X className="w-5 h-5 text-red-400" />
                )}
                {toast.type === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                {toast.type === 'warning' && (
                  <ArrowRight className="w-5 h-5 text-yellow-400" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">
                  {toast.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setToast(prev => ({ ...prev, show: false }))}
                  className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
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
                onClick={() => window.location.href = '/agents'}
                className="p-2 rounded-lg transition-colors"
                style={{ color: '#718096' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = '#4a5568';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#718096';
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="calendly-h1" style={{ marginBottom: '8px' }}>Create AI Agent</h1>
                <p className="calendly-body">Build your personal automated workflow assistant</p>
              </div>
            </div>
          </div>

          {/* Vertical Flow Sections */}
          {renderWorkflowSelection()}
          
          {workflowSelected && renderParametersConfiguration()}
          
          {parametersConfigured && renderReview()}
        </div>
      </div>
    </div>
  );
}