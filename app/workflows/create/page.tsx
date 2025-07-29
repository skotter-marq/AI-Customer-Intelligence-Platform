'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  ExternalLink,
  Info,
  AlertCircle,
  CheckCircle,
  Globe,
  Webhook,
  Settings,
  PlayCircle,
  Code,
  Database,
  Zap
} from 'lucide-react';

interface WorkflowFormData {
  // Basic Information
  name: string;
  description: string;
  category: string;
  
  // n8n Integration
  n8nWorkflowId: string;
  n8nInstanceUrl: string;
  webhookUrl: string;
  authMethod: 'none' | 'api_key' | 'basic_auth';
  apiKey: string;
  username: string;
  password: string;
  
  // Workflow Configuration  
  triggerType: 'webhook' | 'schedule' | 'manual';
  isActive: boolean;
  timeout: number;
  retryOnFailure: boolean;
  maxRetries: number;
  
  // Response Handling
  responseMode: 'last_node' | 'respond_to_webhook' | 'no_response';
  responseFormat: 'json' | 'binary' | 'first_entry_json' | 'all_entries';
  
  // Metadata
  tags: string[];
  environment: 'development' | 'staging' | 'production';
}

export default function CreateWorkflowPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<WorkflowFormData>({
    name: '',
    description: '',
    category: 'customer-health',
    n8nWorkflowId: '',
    n8nInstanceUrl: '',
    webhookUrl: '',
    authMethod: 'none',
    apiKey: '',
    username: '',
    password: '',
    triggerType: 'webhook',
    isActive: false,
    timeout: 120,
    retryOnFailure: true,
    maxRetries: 3,
    responseMode: 'last_node',
    responseFormat: 'json',
    tags: [],
    environment: 'development'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof WorkflowFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Workflow name is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.n8nInstanceUrl.trim()) {
      errors.n8nInstanceUrl = 'n8n instance URL is required';
    } else {
      try {
        new URL(formData.n8nInstanceUrl);
      } catch {
        errors.n8nInstanceUrl = 'Please enter a valid URL';
      }
    }

    if (formData.triggerType === 'webhook' && !formData.webhookUrl.trim()) {
      errors.webhookUrl = 'Webhook URL is required for webhook triggers';
    }

    if (formData.authMethod === 'api_key' && !formData.apiKey.trim()) {
      errors.apiKey = 'API key is required for API key authentication';
    }

    if (formData.authMethod === 'basic_auth') {
      if (!formData.username.trim()) {
        errors.username = 'Username is required for basic authentication';
      }
      if (!formData.password.trim()) {
        errors.password = 'Password is required for basic authentication';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real implementation, this would create the workflow via API
      const workflowData = {
        ...formData,
        id: `wf-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: formData.isActive ? 'active' : 'inactive'
      };

      console.log('Creating workflow:', workflowData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect to workflows list
      router.push('/workflows');
    } catch (error) {
      console.error('Failed to create workflow:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.n8nInstanceUrl) {
      alert('Please enter n8n instance URL first');
      return;
    }

    try {
      // Test connection to n8n instance
      console.log('Testing connection to:', formData.n8nInstanceUrl);
      // In real implementation, make API call to test connection
      alert('Connection test successful!');
    } catch (error) {
      alert('Connection test failed. Please check your n8n instance URL and authentication.');
    }
  };

  return (
    <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
      {/* Navigation */}
      <div className="calendly-card-static border-b" style={{ margin: '0 24px 24px 24px', padding: '16px 24px', borderRadius: '0' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/workflows')}
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
            </button>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => router.push('/workflows')}
                className="calendly-body-sm"
                style={{ color: '#718096' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#4285f4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#718096';
                }}
              >
                Workflows
              </button>
              <span style={{ color: '#a0aec0' }}>›</span>
              <span className="calendly-body-sm font-medium" style={{ color: '#1a1a1a' }}>Create Workflow</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="calendly-card">
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="w-6 h-6" style={{ color: '#4285f4' }} />
                <h2 className="calendly-h2">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Customer Health Analysis Pipeline"
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="customer-health">Customer Health</option>
                    <option value="competitive-intel">Competitive Intelligence</option>
                    <option value="content-generation">Content Generation</option>
                    <option value="lead-management">Lead Management</option>
                    <option value="data-processing">Data Processing</option>
                    <option value="notifications">Notifications</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe what this workflow does and its purpose..."
                  />
                  {validationErrors.description && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* n8n Integration */}
            <div className="calendly-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Zap className="w-6 h-6" style={{ color: '#4285f4' }} />
                  <h2 className="calendly-h2">n8n Integration</h2>
                </div>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  className="calendly-btn-secondary flex items-center space-x-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Test Connection</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    n8n Instance URL *
                  </label>
                  <input
                    type="url"
                    value={formData.n8nInstanceUrl}
                    onChange={(e) => handleInputChange('n8nInstanceUrl', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.n8nInstanceUrl ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="https://your-n8n-instance.com"
                  />
                  {validationErrors.n8nInstanceUrl && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.n8nInstanceUrl}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    n8n Workflow ID
                  </label>
                  <input
                    type="text"
                    value={formData.n8nWorkflowId}
                    onChange={(e) => handleInputChange('n8nWorkflowId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Leave empty to create new workflow"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Optional: Link to existing n8n workflow
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trigger Type
                  </label>
                  <select
                    value={formData.triggerType}
                    onChange={(e) => handleInputChange('triggerType', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="webhook">Webhook</option>
                    <option value="schedule">Schedule</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Environment
                  </label>
                  <select
                    value={formData.environment}
                    onChange={(e) => handleInputChange('environment', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </div>

                {formData.triggerType === 'webhook' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook URL *
                    </label>
                    <input
                      type="url"
                      value={formData.webhookUrl}
                      onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.webhookUrl ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="https://your-n8n-instance.com/webhook/your-webhook-path"
                    />
                    {validationErrors.webhookUrl && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validationErrors.webhookUrl}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Authentication */}
            <div className="calendly-card">
              <div className="flex items-center space-x-3 mb-6">
                <Database className="w-6 h-6" style={{ color: '#4285f4' }} />
                <h2 className="calendly-h2">Authentication</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Authentication Method
                  </label>
                  <select
                    value={formData.authMethod}
                    onChange={(e) => handleInputChange('authMethod', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="none">None</option>
                    <option value="api_key">API Key</option>
                    <option value="basic_auth">Basic Authentication</option>
                  </select>
                </div>

                {formData.authMethod === 'api_key' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key *
                    </label>
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => handleInputChange('apiKey', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.apiKey ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your n8n API key"
                    />
                    {validationErrors.apiKey && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {validationErrors.apiKey}
                      </p>
                    )}
                  </div>
                )}

                {formData.authMethod === 'basic_auth' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username *
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.username ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Username"
                      />
                      {validationErrors.username && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.username}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Password"
                      />
                      {validationErrors.password && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {validationErrors.password}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Configuration */}
            <div className="calendly-card">
              <div className="flex items-center space-x-3 mb-6">
                <Settings className="w-6 h-6" style={{ color: '#4285f4' }} />
                <h2 className="calendly-h2">Workflow Configuration</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeout (seconds)
                  </label>
                  <input
                    type="number"
                    value={formData.timeout}
                    onChange={(e) => handleInputChange('timeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="3600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Retries
                  </label>
                  <input
                    type="number"
                    value={formData.maxRetries}
                    onChange={(e) => handleInputChange('maxRetries', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Mode
                  </label>
                  <select
                    value={formData.responseMode}
                    onChange={(e) => handleInputChange('responseMode', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="last_node">Last Node Response</option>
                    <option value="respond_to_webhook">Respond to Webhook Node</option>
                    <option value="no_response">No Response</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Format
                  </label>
                  <select
                    value={formData.responseFormat}
                    onChange={(e) => handleInputChange('responseFormat', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="json">JSON Object</option>
                    <option value="all_entries">All Entries Array</option>
                    <option value="first_entry_json">First Entry JSON</option>
                    <option value="binary">Binary Data</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Activate workflow immediately
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="retryOnFailure"
                    checked={formData.retryOnFailure}
                    onChange={(e) => handleInputChange('retryOnFailure', e.target.checked)}
                    className="rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="retryOnFailure" className="text-sm font-medium text-gray-700">
                    Retry on failure
                  </label>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push('/workflows')}
                className="calendly-btn-secondary"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Create Workflow</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}