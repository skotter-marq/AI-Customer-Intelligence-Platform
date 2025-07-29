'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bot, Settings, GitBranch, Play, Pause, Edit3, Plus, ExternalLink } from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  category: 'customer-health' | 'competitive-intel' | 'content-generation' | 'automation';
  execution_count: number;
  last_executed: string;
  created_by: string;
  n8n_id: string;
  has_interface_node: boolean;
  connected_agents: number;
  connected_apps: number;
}

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'customer-health' | 'competitive-intel' | 'content-generation' | 'automation'>('all');
  const [isN8nConnected, setIsN8nConnected] = useState(false);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      // Load workflows from API with n8n integration
      const response = await fetch('/api/workflows');
      const data = await response.json();
      
      if (data.success) {
        // Transform API data to match UI interface
        const transformedWorkflows: Workflow[] = data.workflows.map((wf: any) => ({
          id: wf.id,
          name: wf.name,
          description: wf.description,
          status: wf.actual_status || wf.status,
          category: wf.category,
          execution_count: wf.executions_this_week || 0,
          last_executed: wf.last_execution || wf.updated_at,
          created_by: wf.created_by || 'System',
          n8n_id: wf.n8n_workflow_id,
          has_interface_node: wf.node_count > 5, // Simple heuristic
          connected_agents: 0, // Will be populated from agents API later
          connected_apps: wf.webhook_url ? 1 : 0,
          // Additional n8n specific data
          n8n_active: wf.n8n_active,
          node_count: wf.node_count || 0,
          complexity_score: wf.complexity_score || 0,
          success_rate: wf.success_rate || 0,
          environment: wf.environment
        }));
        
        setWorkflows(transformedWorkflows);
        
        // Set n8n connection status if available
        if (data.n8n_connected !== undefined) {
          setIsN8nConnected(data.n8n_connected);
        }
      } else {
        console.error('Failed to load workflows:', data.error);
        setWorkflows([]);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkflows = workflows.filter(workflow => 
    selectedCategory === 'all' || workflow.category === selectedCategory
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'customer-health': return '💓';
      case 'competitive-intel': return '🎯';
      case 'content-generation': return '✍️';
      case 'automation': return '⚡';
      default: return '⚙️';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'customer-health': return 'Customer Health';
      case 'competitive-intel': return 'Competitive Intel';
      case 'content-generation': return 'Content Generation';
      case 'automation': return 'Automation';
      default: return 'Other';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
            <div>
              <h1 className="calendly-h1">Workflows</h1>
              <p className="calendly-body">n8n business logic and automation pipelines</p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => window.open('https://n8n.io', '_blank')}
                className="calendly-btn-secondary flex items-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open n8n</span>
              </button>
              <button 
                onClick={() => window.location.href = '/workflows/create'}
                className="calendly-btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Workflow</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Workflows</p>
                  <p className="text-2xl font-bold text-gray-900">{workflows.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Workflows</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {workflows.filter(w => w.status === 'active').length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Executions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {workflows.reduce((sum, w) => sum + w.execution_count, 0)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">With Interface Nodes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {workflows.filter(w => w.has_interface_node).length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Filter by category:</span>
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'All Workflows' },
                  { key: 'customer-health', label: 'Customer Health' },
                  { key: 'competitive-intel', label: 'Competitive Intel' },
                  { key: 'content-generation', label: 'Content Generation' },
                  { key: 'automation', label: 'Automation' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key as any)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === key
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Workflows Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading workflows...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredWorkflows.map((workflow) => (
                <div 
                  key={workflow.id} 
                  onClick={() => router.push(`/workflows/${workflow.id}`)}
                  className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:shadow-md hover:border-indigo-300 transition-all duration-200 cursor-pointer focus:outline-none"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                        {getCategoryIcon(workflow.category)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)}`}>
                          {workflow.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {workflow.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium">{getCategoryLabel(workflow.category)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Executions:</span>
                      <span className="font-medium">{workflow.execution_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Last Run:</span>
                      <span className="font-medium">{formatDate(workflow.last_executed)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Connected:</span>
                      <span className="font-medium">
                        {workflow.connected_agents} agents, {workflow.connected_apps} apps
                      </span>
                    </div>
                    {workflow.has_interface_node && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Interface Node:</span>
                        <span className="font-medium text-green-600">✓ Enabled</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/workflows/${workflow.id}`);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://n8n.io/workflow/${workflow.n8n_id}`, '_blank');
                      }}
                      className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                      Edit in n8n
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredWorkflows.length === 0 && !loading && (
            <div className="text-center py-12">
              <GitBranch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
              <p className="text-gray-600 mb-4">
                {selectedCategory === 'all' 
                  ? "Create your first workflow to get started."
                  : `No ${getCategoryLabel(selectedCategory)} workflows found. Try a different filter.`
                }
              </p>
              <button 
                onClick={() => window.location.href = '/workflows/create'}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create Workflow
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}