'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bot,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  FileText,
  MessageSquare,
  Users,
  Zap,
  ArrowLeft,
  CheckCircle,
  Eye,
  Settings,
  Copy,
  RefreshCw
} from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';

interface AIPrompt {
  id: string;
  name: string;
  description: string;
  category: 'meeting_analysis' | 'content_generation' | 'hubspot_analysis' | 'competitive_intelligence' | 'customer_insights';
  prompt_template: string;
  system_instructions: string;
  parameters: {
    temperature: number;
    max_tokens: number;
    model: string;
  };
  variables: string[];
  enabled: boolean;
  usage_count: number;
  last_used: string;
  version: string;
}

export default function AIPromptsPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  const breadcrumbItems = [
    { label: 'Admin Settings', href: '/admin/settings' },
    { label: 'AI Prompt Management', current: true }
  ];

  const categories = [
    { id: 'all', name: 'All Prompts', icon: Bot, count: 0 },
    { id: 'meeting_analysis', name: 'Meeting Analysis', icon: Users, count: 0 },
    { id: 'content_generation', name: 'Content Generation', icon: FileText, count: 0 },
    { id: 'hubspot_analysis', name: 'HubSpot Analysis', icon: Zap, count: 0 },
    { id: 'competitive_intelligence', name: 'Competitive Intel', icon: Eye, count: 0 },
    { id: 'customer_insights', name: 'Customer Insights', icon: MessageSquare, count: 0 }
  ];

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      // In a real app, this would fetch from your database
      // For now, we'll use the prompts from your existing system
      const defaultPrompts: AIPrompt[] = [
        {
          id: 'transcript-analysis',
          name: 'Meeting Transcript Analysis',
          description: 'Extracts customer insights, pain points, and opportunities from meeting transcripts',
          category: 'meeting_analysis',
          prompt_template: `You are an expert customer intelligence analyst. Analyze the following meeting transcript and extract key insights.

MEETING CONTEXT:
- Company: {company}
- Meeting Type: {meetingType}
- Date: {date}
- Participants: {participants}

TRANSCRIPT:
{transcript}

ANALYSIS INSTRUCTIONS:
Please analyze this transcript and provide insights in the following JSON format:

{
  "insights": [
    {
      "type": "pain_point|feature_request|sentiment|opportunity|risk",
      "title": "Brief descriptive title",
      "description": "Detailed description of the insight",
      "sentiment_score": -1.0 to 1.0,
      "confidence_score": 0.0 to 1.0,
      "priority": "high|medium|low",
      "tags": ["tag1", "tag2", "tag3"],
      "quotes": ["relevant quote from transcript"]
    }
  ],
  "overall_sentiment": -1.0 to 1.0,
  "key_topics": ["topic1", "topic2", "topic3"],
  "recommended_actions": [
    {
      "action": "Brief action description",
      "priority": "high|medium|low",
      "urgency": "immediate|this_week|this_month"
    }
  ],
  "summary": "Brief 2-3 sentence summary of the meeting"
}

FOCUS ON:
- Customer pain points and frustrations
- Feature requests and product feedback
- Competitive mentions
- Renewal/expansion opportunities
- Technical issues or blockers
- Positive feedback and satisfaction indicators

Return only the JSON response, no additional text.`,
          system_instructions: 'You are an expert customer intelligence analyst focused on extracting actionable business insights.',
          parameters: {
            temperature: 0.3,
            max_tokens: 2000,
            model: 'claude-3-5-sonnet-20241022'
          },
          variables: ['company', 'meetingType', 'date', 'participants', 'transcript'],
          enabled: true,
          usage_count: 347,
          last_used: '2025-01-30T14:30:00Z',
          version: '1.2'
        },
        {
          id: 'case-study-generation',
          name: 'Customer Success Story Generator',
          description: 'Generates customer case studies from meeting insights and customer data',
          category: 'content_generation',
          prompt_template: `Create a compelling customer success story based on the following information:

CUSTOMER INFORMATION:
- Company: {customer_name}
- Industry: {industry}
- Company Size: {company_size}
- Contact: {contact_name}, {contact_title}

CHALLENGE & SOLUTION:
- Challenge: {challenge_description}
- Impact Area: {impact_area}
- Solution: {solution_description}

RESULTS:
{results_data}

CUSTOMER FEEDBACK:
"{customer_quote}"

Please create a professional case study with:
1. Compelling headline
2. Executive summary
3. Challenge section
4. Solution section  
5. Results section with metrics
6. Customer testimonial
7. Call-to-action

Format as markdown with proper headings and structure.`,
          system_instructions: 'You are a professional marketing content writer specializing in customer success stories.',
          parameters: {
            temperature: 0.7,
            max_tokens: 1500,
            model: 'gpt-4'
          },
          variables: ['customer_name', 'industry', 'company_size', 'contact_name', 'contact_title', 'challenge_description', 'impact_area', 'solution_description', 'results_data', 'customer_quote'],
          enabled: true,
          usage_count: 89,
          last_used: '2025-01-29T16:45:00Z',
          version: '2.1'
        },
        {
          id: 'hubspot-contact-analysis',
          name: 'HubSpot Contact Intelligence',
          description: 'Analyzes HubSpot contact data to identify patterns and opportunities',
          category: 'hubspot_analysis',
          prompt_template: `Analyze the following HubSpot contact data and provide actionable intelligence:

CONTACT DATA:
{hubspot_data}

ANALYSIS TYPE: {analysis_type}

Please provide insights in JSON format:
{
  "contact_insights": [
    {
      "insight_type": "opportunity|risk|pattern|anomaly",
      "title": "Brief insight title",
      "description": "Detailed analysis",
      "confidence": 0.0 to 1.0,
      "recommended_actions": ["action1", "action2"]
    }
  ],
  "overall_score": 0 to 100,
  "priority_level": "high|medium|low",
  "next_steps": ["step1", "step2", "step3"]
}

Focus on:
- Engagement patterns
- Deal progression indicators
- Churn risk signals
- Upsell opportunities
- Communication preferences`,
          system_instructions: 'You are a CRM data analyst expert at identifying sales and customer success opportunities.',
          parameters: {
            temperature: 0.3,
            max_tokens: 1000,
            model: 'claude-3-5-sonnet-20241022'
          },
          variables: ['hubspot_data', 'analysis_type'],
          enabled: true,
          usage_count: 156,
          last_used: '2025-01-30T12:15:00Z',
          version: '1.0'
        },
        {
          id: 'feature-announcement',
          name: 'Product Feature Announcement',
          description: 'Creates feature announcement content from JIRA updates and product data',
          category: 'content_generation',
          prompt_template: `Create a product feature announcement based on:

FEATURE DETAILS:
- Feature Name: {feature_name}
- JIRA Ticket: {jira_key}
- Description: {feature_description}
- Target Audience: {target_audience}
- Benefits: {key_benefits}
- Release Date: {release_date}

CUSTOMER CONTEXT:
{customer_feedback}

Create content for:
1. **Email Announcement** (150-200 words)
2. **In-App Notification** (50 words max)
3. **Blog Post Excerpt** (100 words)
4. **Social Media Post** (280 characters)

Format as markdown with clear sections.
Focus on customer value and benefits, not technical details.`,
          system_instructions: 'You are a product marketing specialist creating customer-focused feature announcements.',
          parameters: {
            temperature: 0.6,
            max_tokens: 1200,
            model: 'gpt-4'
          },
          variables: ['feature_name', 'jira_key', 'feature_description', 'target_audience', 'key_benefits', 'release_date', 'customer_feedback'],
          enabled: true,
          usage_count: 234,
          last_used: '2025-01-30T09:20:00Z',
          version: '1.5'
        },
        {
          id: 'competitive-analysis',
          name: 'Competitive Intelligence Summary',
          description: 'Analyzes competitive signals and creates actionable intelligence reports',
          category: 'competitive_intelligence',
          prompt_template: `Analyze the following competitive intelligence data:

COMPETITOR: {competitor_name}
DATA SOURCES: {data_sources}
TIME PERIOD: {time_period}

SIGNALS DATA:
{signals_data}

Create a competitive intelligence summary with:

1. **Executive Summary** (3-4 sentences)
2. **Key Findings** (bullet points)
3. **Threat Level Assessment** (High/Medium/Low with rationale)
4. **Strategic Implications** for our product roadmap
5. **Recommended Actions** (immediate and long-term)
6. **Monitoring Recommendations** for ongoing intelligence

Format as structured markdown.
Focus on actionable insights, not just data reporting.`,
          system_instructions: 'You are a competitive intelligence analyst providing strategic business insights.',
          parameters: {
            temperature: 0.4,
            max_tokens: 1500,
            model: 'claude-3-5-sonnet-20241022'
          },
          variables: ['competitor_name', 'data_sources', 'time_period', 'signals_data'],
          enabled: true,
          usage_count: 67,
          last_used: '2025-01-28T14:10:00Z',
          version: '1.1'
        }
      ];
      
      setPrompts(defaultPrompts);
      setLoading(false);
    } catch (error) {
      console.error('Error loading AI prompts:', error);
      setMessage({ type: 'error', text: 'Failed to load AI prompts' });
      setLoading(false);
    }
  };

  const savePrompts = async () => {
    setSaving(true);
    try {
      // In a real app, this would save to your database
      console.log('Saving AI prompts:', prompts);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'AI prompts saved successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving AI prompts:', error);
      setMessage({ type: 'error', text: 'Failed to save AI prompts' });
    } finally {
      setSaving(false);
    }
  };

  const addPrompt = () => {
    const newPrompt: AIPrompt = {
      id: `prompt-${Date.now()}`,
      name: 'New AI Prompt',
      description: 'Description for new AI prompt',
      category: 'content_generation',
      prompt_template: 'Enter your AI prompt template here...',
      system_instructions: 'You are a helpful AI assistant.',
      parameters: {
        temperature: 0.5,
        max_tokens: 1000,
        model: 'claude-3-5-sonnet-20241022'
      },
      variables: [],
      enabled: true,
      usage_count: 0,
      last_used: new Date().toISOString(),
      version: '1.0'
    };
    
    setPrompts([...prompts, newPrompt]);
  };

  const removePrompt = (promptId: string) => {
    setPrompts(prompts.filter(p => p.id !== promptId));
  };

  const updatePrompt = (promptId: string, updates: Partial<AIPrompt>) => {
    setPrompts(prompts.map(p => p.id === promptId ? { ...p, ...updates } : p));
  };

  const duplicatePrompt = (promptId: string) => {
    const original = prompts.find(p => p.id === promptId);
    if (!original) return;

    const duplicate: AIPrompt = {
      ...original,
      id: `${original.id}-copy-${Date.now()}`,
      name: `${original.name} (Copy)`,
      usage_count: 0,
      last_used: new Date().toISOString(),
      version: '1.0'
    };
    
    setPrompts([...prompts, duplicate]);
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    const matchesSearch = prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Update category counts
  const updatedCategories = categories.map(cat => ({
    ...cat,
    count: cat.id === 'all' 
      ? prompts.length 
      : prompts.filter(p => p.category === cat.id).length
  }));

  const getCategoryColor = (category: string) => {
    const colors = {
      'meeting_analysis': 'text-blue-600 bg-blue-50 border-blue-200',
      'content_generation': 'text-green-600 bg-green-50 border-green-200',
      'hubspot_analysis': 'text-purple-600 bg-purple-50 border-purple-200',
      'competitive_intelligence': 'text-red-600 bg-red-50 border-red-200',
      'customer_insights': 'text-yellow-600 bg-yellow-50 border-yellow-200'
    };
    return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-4" style={{ background: '#f8fafc' }}>
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Bot className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="calendly-body text-gray-600">Loading AI prompts...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-4" style={{ background: '#f8fafc' }}>
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="calendly-h2">AI Prompt Management</h1>
              <p className="calendly-body text-gray-600 mt-2">
                Centralized management of all AI prompts for content generation, analysis, and automation.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={addPrompt}
                className="calendly-button calendly-button-secondary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Prompt</span>
              </button>
              <button
                onClick={savePrompts}
                disabled={saving}
                className="calendly-button calendly-button-primary flex items-center space-x-2"
              >
                {saving ? (
                  <Settings className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg border flex items-center space-x-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="calendly-body">{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Categories & Search */}
            <div className="lg:col-span-1">
              <div className="calendly-card mb-4">
                <h3 className="calendly-h3 mb-4">Search & Filter</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Search prompts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                  />
                  
                  <div>
                    <h4 className="calendly-label font-medium mb-2">Categories</h4>
                    <div className="space-y-1">
                      {updatedCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                              selectedCategory === category.id
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <Icon className="w-4 h-4" />
                              <span className="calendly-label-sm">{category.name}</span>
                            </div>
                            <span className="calendly-label-sm text-gray-500">{category.count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Prompts */}
            <div className="lg:col-span-3">
              <div className="space-y-4">
                {filteredPrompts.map((prompt) => (
                  <div key={prompt.id} className="calendly-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(prompt.category)}`}>
                          <Bot className="w-5 h-5" />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={prompt.name}
                            onChange={(e) => updatePrompt(prompt.id, { name: e.target.value })}
                            className="calendly-h3 bg-transparent border-none outline-none"
                          />
                          <p className="calendly-label-sm text-gray-600">
                            {prompt.category.replace('_', ' ')} • Used {prompt.usage_count} times • v{prompt.version}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={prompt.enabled}
                            onChange={(e) => updatePrompt(prompt.id, { enabled: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="calendly-label-sm text-gray-600">Enabled</span>
                        </label>
                        
                        <button
                          onClick={() => setExpandedPrompt(expandedPrompt === prompt.id ? null : prompt.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => duplicatePrompt(prompt.id)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => removePrompt(prompt.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <textarea
                        value={prompt.description}
                        onChange={(e) => updatePrompt(prompt.id, { description: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none calendly-body"
                        rows={2}
                        placeholder="Prompt description..."
                      />
                    </div>

                    {expandedPrompt === prompt.id && (
                      <div className="border-t pt-4 space-y-4">
                        <div>
                          <label className="calendly-label font-medium mb-2 block">Prompt Template</label>
                          <textarea
                            value={prompt.prompt_template}
                            onChange={(e) => updatePrompt(prompt.id, { prompt_template: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg resize-none calendly-body font-mono text-sm"
                            rows={12}
                            placeholder="Enter your AI prompt template..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="calendly-label font-medium mb-2 block">System Instructions</label>
                            <textarea
                              value={prompt.system_instructions}
                              onChange={(e) => updatePrompt(prompt.id, { system_instructions: e.target.value })}
                              className="w-full p-3 border border-gray-300 rounded-lg resize-none calendly-body"
                              rows={3}
                              placeholder="System instructions for the AI..."
                            />
                          </div>

                          <div>
                            <label className="calendly-label font-medium mb-2 block">Parameters</label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className="calendly-label-sm w-20">Temperature:</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="1"
                                  step="0.1"
                                  value={prompt.parameters.temperature}
                                  onChange={(e) => updatePrompt(prompt.id, { 
                                    parameters: { ...prompt.parameters, temperature: parseFloat(e.target.value) }
                                  })}
                                  className="flex-1 p-2 border border-gray-300 rounded calendly-body"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="calendly-label-sm w-20">Max Tokens:</span>
                                <input
                                  type="number"
                                  min="100"
                                  max="4000"
                                  step="100"
                                  value={prompt.parameters.max_tokens}
                                  onChange={(e) => updatePrompt(prompt.id, { 
                                    parameters: { ...prompt.parameters, max_tokens: parseInt(e.target.value) }
                                  })}
                                  className="flex-1 p-2 border border-gray-300 rounded calendly-body"
                                />
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="calendly-label-sm w-20">Model:</span>
                                <select
                                  value={prompt.parameters.model}
                                  onChange={(e) => updatePrompt(prompt.id, { 
                                    parameters: { ...prompt.parameters, model: e.target.value }
                                  })}
                                  className="flex-1 p-2 border border-gray-300 rounded calendly-body"
                                >
                                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                                  <option value="gpt-4">GPT-4</option>
                                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="calendly-label font-medium mb-2 block">Template Variables</label>
                          <input
                            type="text"
                            value={prompt.variables.join(', ')}
                            onChange={(e) => updatePrompt(prompt.id, { 
                              variables: e.target.value.split(',').map(v => v.trim()).filter(v => v)
                            })}
                            className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                            placeholder="variable1, variable2, variable3"
                          />
                          <p className="calendly-label-sm text-gray-500 mt-1">
                            Variables used in the prompt template (e.g., {'{company}, {transcript}'})
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {filteredPrompts.length === 0 && (
                  <div className="text-center py-12">
                    <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="calendly-h3 text-gray-600 mb-2">No prompts found</h3>
                    <p className="calendly-body text-gray-500 mb-4">
                      {searchTerm || selectedCategory !== 'all' 
                        ? 'Try adjusting your search or filter criteria.'
                        : 'Add your first AI prompt to get started.'
                      }
                    </p>
                    {!searchTerm && selectedCategory === 'all' && (
                      <button
                        onClick={addPrompt}
                        className="calendly-button calendly-button-primary flex items-center space-x-2 mx-auto"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Your First Prompt</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}