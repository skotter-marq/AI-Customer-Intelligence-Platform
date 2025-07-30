'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bot,
  Save,
  RotateCcw,
  TestTube,
  Settings,
  AlertCircle,
  CheckCircle,
  Edit3,
  Copy,
  History,
  Play,
  MessageSquare,
  FileText,
  Users,
  Zap,
  Eye,
  Slack,
  Hash,
  Bell
} from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';

interface AIPrompt {
  id: string;
  name: string;
  description: string;
  type: 'ai_analysis' | 'content_generation' | 'slack_template';
  category: string;
  template: string;
  systemInstructions?: string;
  channel?: string; // For Slack templates
  parameters: {
    temperature: number;
    maxTokens: number;
    model: string;
  };
  variables: string[];
  enabled: boolean;
  version: string;
  lastModified: string;
  usageCount: number;
  triggerEvent?: string;
}

export default function AIPromptsPage() {
  const router = useRouter();
  const [activePrompt, setActivePrompt] = useState<string>('meeting-analysis');
  const [editingTemplate, setEditingTemplate] = useState<string>('');
  const [editingSystemInstructions, setEditingSystemInstructions] = useState<string>('');
  const [editingChannel, setEditingChannel] = useState<string>('');
  const [editingParameters, setEditingParameters] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingPrompt, setIsTestingPrompt] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('ai_analysis');

  const breadcrumbItems = [
    { label: 'Admin Settings', href: '/admin/settings' },
    { label: 'AI Prompts & Templates', current: true }
  ];

  // Combined prompts - AI analysis, content generation, and Slack templates
  const [prompts, setPrompts] = useState<AIPrompt[]>([
    // AI Analysis Prompts
    {
      id: 'meeting-analysis',
      name: 'Meeting Transcript Analysis',
      description: 'Extracts customer insights, pain points, and opportunities from meeting transcripts',
      type: 'ai_analysis',
      category: 'Meeting Analysis',
      version: '2.1',
      lastModified: '2025-01-30T14:30:00Z',
      usageCount: 347,
      enabled: true,
      systemInstructions: 'You are an expert customer intelligence analyst focused on extracting actionable business insights from meeting conversations.',
      parameters: {
        temperature: 0.3,
        maxTokens: 2000,
        model: 'claude-3-5-sonnet-20241022'
      },
      variables: ['company', 'meetingType', 'date', 'participants', 'transcript'],
      template: `You are an expert customer intelligence analyst. Analyze the following meeting transcript and extract key insights.

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

Return only the JSON response, no additional text.`
    },
    {
      id: 'competitive-analysis',
      name: 'Competitive Intelligence Analysis',
      description: 'Analyzes competitive signals and market intelligence data',
      type: 'ai_analysis',
      category: 'Competitive Intelligence',
      version: '1.3',
      lastModified: '2025-01-28T16:20:00Z',
      usageCount: 89,
      enabled: true,
      systemInstructions: 'You are a competitive intelligence analyst providing strategic business insights for product and marketing decisions.',
      parameters: {
        temperature: 0.4,
        maxTokens: 1500,
        model: 'claude-3-5-sonnet-20241022'
      },
      variables: ['competitor', 'signals', 'timeframe', 'sources'],
      template: `Analyze the following competitive intelligence data and provide strategic insights:

COMPETITOR: {competitor}
TIME FRAME: {timeframe}
DATA SOURCES: {sources}

SIGNALS DATA:
{signals}

Please provide analysis in this JSON format:

{
  "threat_level": "high|medium|low",
  "key_findings": ["finding1", "finding2", "finding3"],
  "strategic_implications": {
    "product": ["implication1", "implication2"],
    "marketing": ["implication1", "implication2"],
    "sales": ["implication1", "implication2"]
  },
  "recommended_actions": [
    {
      "action": "specific action",
      "priority": "high|medium|low",
      "timeline": "immediate|short_term|long_term",
      "department": "product|marketing|sales|engineering"
    }
  ],
  "monitoring_recommendations": ["what to track going forward"],
  "executive_summary": "2-3 sentence summary for leadership"
}

Focus on actionable intelligence that drives business decisions.`
    },
    // Content Generation Prompts  
    {
      id: 'case-study-generator',
      name: 'Customer Success Story',
      description: 'Generates compelling customer case studies from meeting insights',
      type: 'content_generation',
      category: 'Marketing Content',
      version: '2.0',
      lastModified: '2025-01-29T11:15:00Z',
      usageCount: 156,
      enabled: true,
      systemInstructions: 'You are a professional marketing content writer specializing in customer success stories that drive sales and showcase product value.',
      parameters: {
        temperature: 0.7,
        maxTokens: 1500,
        model: 'gpt-4'
      },
      variables: ['customer_name', 'industry', 'challenge', 'solution', 'results', 'quote'],
      template: `Create a compelling customer success story based on this information:

CUSTOMER: {customer_name}
INDUSTRY: {industry}
CHALLENGE: {challenge}
SOLUTION: {solution}
RESULTS: {results}
CUSTOMER QUOTE: "{quote}"

Create a professional case study with:

# Success Story: How {customer_name} [Achieved Specific Result]

## The Challenge
[Describe the customer's challenge in a relatable way]

## The Solution  
[Explain how your product/service solved their problem]

## The Results
[Quantified outcomes with specific metrics]

## What They're Saying
> "{quote}"
> — [Name, Title, Company]

## The Bottom Line
[Summary of value delivered]

**Key Takeaways:**
- [Takeaway 1]
- [Takeaway 2] 
- [Takeaway 3]

Focus on customer value, specific outcomes, and relatable challenges.`
    },
    {
      id: 'feature-announcement',
      name: 'Product Feature Announcement',
      description: 'Creates customer-focused feature announcements from JIRA updates',
      type: 'content_generation',
      category: 'Product Marketing',
      version: '1.8',
      lastModified: '2025-01-30T09:20:00Z',
      usageCount: 234,
      enabled: true,
      systemInstructions: 'You are a product marketing specialist focused on communicating feature value to customers in clear, benefit-driven language.',
      parameters: {
        temperature: 0.6,
        maxTokens: 1200,
        model: 'gpt-4'
      },
      variables: ['feature_name', 'description', 'benefits', 'target_audience', 'jira_key'],
      template: `Create a customer-focused feature announcement:

FEATURE: {feature_name}
DESCRIPTION: {description}
KEY BENEFITS: {benefits}
TARGET AUDIENCE: {target_audience}
JIRA REFERENCE: {jira_key}

Create content for multiple channels:

## 📧 Email Announcement (150-200 words)
Subject: New Feature: [Benefit-focused headline]

[Customer-focused announcement emphasizing value and benefits]

## 📱 In-App Notification (50 words max)
[Concise, action-oriented message]

## 📝 Blog Post Excerpt (100 words)
[Engaging excerpt that drives readers to full announcement]

## 📱 Social Media (280 characters)
[Shareable message with key benefit]

Guidelines:
- Lead with customer benefits, not features
- Use "you" language 
- Include clear next steps
- Avoid technical jargon
- Focus on business value`
    },
    // Slack Templates
    {
      id: 'slack-product-update',
      name: 'Product Update Published',
      description: 'Slack notification when product updates are published',
      type: 'slack_template',
      category: 'Product Notifications',
      channel: '#product-updates',
      version: '1.5',
      lastModified: '2025-01-30T16:45:00Z',
      usageCount: 445,
      enabled: true,
      triggerEvent: 'product_update_published',
      parameters: {
        temperature: 0,
        maxTokens: 500,
        model: 'template'
      },
      variables: ['updateTitle', 'jiraKey', 'assignee', 'updateDescription', 'customerImpact'],
      template: `🚀 **New Product Update Published**

**Feature:** {updateTitle}
**JIRA Ticket:** {jiraKey}
**Completed by:** {assignee}

**What Changed:**
{updateDescription}

**Customer Impact:**
{customerImpact}

**Resources:**
• [View Full Update]({changelogUrl})
• [Customer Communication Template]({templateUrl})
• [JIRA Ticket]({jiraUrl})`
    },
    {
      id: 'slack-customer-insight',
      name: 'High-Priority Customer Insight',
      description: 'Slack alert for important customer insights from meetings',
      type: 'slack_template',
      category: 'Customer Intelligence',
      channel: '#customer-insights',
      version: '2.0',
      lastModified: '2025-01-30T12:30:00Z',
      usageCount: 178,
      enabled: true,
      triggerEvent: 'high_priority_insight',
      parameters: {
        temperature: 0,
        maxTokens: 500,
        model: 'template'
      },
      variables: ['customerName', 'meetingTitle', 'insightType', 'priorityScore', 'insightSummary'],
      template: `🚨 **High-Priority Customer Insight Detected**

**Customer:** {customerName}
**Meeting:** {meetingTitle}
**Insight Type:** {insightType}
**Priority Score:** {priorityScore}/10

**Key Insight:**
> {insightSummary}

**Recommended Actions:**
{actionItems}

**Customer Quote:**
> "{customerQuote}"

[View Full Analysis]({meetingUrl}) | [Create JIRA Ticket]({jiraCreateUrl})`
    },
    {
      id: 'slack-approval-request',
      name: 'Content Approval Request',
      description: 'Slack notification for content needing approval',
      type: 'slack_template',
      category: 'Content Pipeline',
      channel: '#content-approvals', 
      version: '1.2',
      lastModified: '2025-01-28T14:10:00Z',
      usageCount: 267,
      enabled: true,
      triggerEvent: 'content_pending_approval',
      parameters: {
        temperature: 0,
        maxTokens: 500,
        model: 'template'
      },
      variables: ['contentTitle', 'contentType', 'qualityScore', 'contentSummary'],
      template: `🔍 **New Content Ready for Review**

**Title:** {contentTitle}
**Type:** {contentType}
**Quality Score:** {qualityScore}%
**Created:** {createdDate}

**Summary:** {contentSummary}

**Next Steps:**
• Review content in dashboard
• Approve or request changes
• Content will auto-publish upon approval

[View Content]({contentUrl}) | [Dashboard]({dashboardUrl})`
    }
  ]);

  const promptTypes = [
    { id: 'ai_analysis', name: 'AI Analysis', icon: Bot, description: 'AI prompts for data analysis and insights' },
    { id: 'content_generation', name: 'Content Generation', icon: FileText, description: 'AI prompts for creating marketing content' },
    { id: 'slack_template', name: 'Slack Templates', icon: Slack, description: 'Message templates for Slack notifications' }
  ];

  const filteredPrompts = prompts.filter(prompt => 
    selectedType === 'all' || prompt.type === selectedType
  );

  const activePromptData = prompts.find(p => p.id === activePrompt);

  useEffect(() => {
    if (activePromptData) {
      setEditingTemplate(activePromptData.template);
      setEditingSystemInstructions(activePromptData.systemInstructions || '');
      setEditingChannel(activePromptData.channel || '');
      setEditingParameters(activePromptData.parameters);
    }
  }, [activePrompt, activePromptData]);

  useEffect(() => {
    if (activePromptData) {
      const hasChanges = 
        editingTemplate !== activePromptData.template ||
        editingSystemInstructions !== (activePromptData.systemInstructions || '') ||
        editingChannel !== (activePromptData.channel || '') ||
        JSON.stringify(editingParameters) !== JSON.stringify(activePromptData.parameters);
      
      setHasUnsavedChanges(hasChanges);
    }
  }, [editingTemplate, editingSystemInstructions, editingChannel, editingParameters, activePromptData]);

  const handleSave = async () => {
    if (!activePromptData) return;

    setIsSaving(true);
    try {
      // Update the prompt
      const updatedPrompts = prompts.map(prompt => 
        prompt.id === activePrompt 
          ? {
              ...prompt,
              template: editingTemplate,
              systemInstructions: editingSystemInstructions,
              channel: editingChannel,
              parameters: editingParameters,
              lastModified: new Date().toISOString()
            }
          : prompt
      );
      
      setPrompts(updatedPrompts);
      setHasUnsavedChanges(false);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Prompt saved:', activePrompt);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (activePromptData) {
      setEditingTemplate(activePromptData.template);
      setEditingSystemInstructions(activePromptData.systemInstructions || '');
      setEditingChannel(activePromptData.channel || '');
      setEditingParameters(activePromptData.parameters);
      setHasUnsavedChanges(false);
    }
  };

  const handleTest = async () => {
    setIsTestingPrompt(true);
    setTestResult(null);
    
    try {
      // Simulate test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTestResult({
        success: true,
        message: `${activePromptData?.type === 'slack_template' ? 'Template' : 'Prompt'} test completed successfully!`,
        preview: activePromptData?.type === 'slack_template' 
          ? 'Message would be sent to ' + editingChannel
          : 'AI analysis would be generated with current prompt'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTestingPrompt(false);
    }
  };

  const getCategoryIcon = (prompt: AIPrompt) => {
    if (prompt.type === 'slack_template') return Slack;
    if (prompt.type === 'content_generation') return FileText;
    return Bot;
  };

  const getCategoryColor = (prompt: AIPrompt) => {
    const colors = {
      'ai_analysis': 'text-blue-600 bg-blue-50 border-blue-200',
      'content_generation': 'text-green-600 bg-green-50 border-green-200', 
      'slack_template': 'text-purple-600 bg-purple-50 border-purple-200'
    };
    return colors[prompt.type] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (!activePromptData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-4" style={{ background: '#f8fafc' }}>
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="calendly-h2">AI Prompts & Templates</h1>
              <p className="calendly-body text-gray-600 mt-2">
                Centralized management of AI prompts, content generation, and Slack message templates.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleReset}
                disabled={!hasUnsavedChanges}
                className="calendly-button calendly-button-secondary flex items-center space-x-2 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleTest}
                disabled={isTestingPrompt}
                className="calendly-button calendly-button-secondary flex items-center space-x-2 disabled:opacity-50"
              >
                {isTestingPrompt ? (
                  <Settings className="w-4 h-4 animate-spin" />
                ) : (
                  <TestTube className="w-4 h-4" />
                )}
                <span>Test</span>
              </button>
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                className="calendly-button calendly-button-primary flex items-center space-x-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <Settings className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Type Filter */}
              <div className="calendly-card mb-4">
                <h3 className="calendly-h3 mb-4">Prompt Types</h3>
                {promptTypes.map((type) => {
                  const Icon = type.icon;
                  const typePrompts = prompts.filter(p => p.type === type.id);
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left mb-2 transition-colors ${
                        selectedType === type.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <div>
                          <div className="calendly-body font-medium">{type.name}</div>
                          <div className="calendly-label-sm text-gray-500">{type.description}</div>
                        </div>
                      </div>
                      <span className="calendly-label-sm font-medium">{typePrompts.length}</span>
                    </button>
                  );
                })}
              </div>

              {/* Prompt List */}
              <div className="calendly-card">
                <h3 className="calendly-h3 mb-4">
                  {promptTypes.find(t => t.id === selectedType)?.name || 'All Prompts'}
                </h3>
                <div className="space-y-2">
                  {filteredPrompts.map((prompt) => {
                    const Icon = getCategoryIcon(prompt);
                    return (
                      <button
                        key={prompt.id}
                        onClick={() => setActivePrompt(prompt.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          activePrompt === prompt.id
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-1.5 rounded ${getCategoryColor(prompt)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="calendly-body font-medium truncate">{prompt.name}</div>
                            <div className="calendly-label-sm text-gray-500">
                              {prompt.category} • v{prompt.version}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="calendly-card">
                {/* Prompt Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(activePromptData)}`}>
                      {React.createElement(getCategoryIcon(activePromptData), { className: "w-6 h-6" })}
                    </div>
                    <div>
                      <h2 className="calendly-h2">{activePromptData.name}</h2>
                      <p className="calendly-body text-gray-600">{activePromptData.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="calendly-label-sm text-gray-500">Used {activePromptData.usageCount} times</div>
                      <div className="calendly-label-sm text-gray-500">Version {activePromptData.version}</div>
                    </div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={activePromptData.enabled}
                        onChange={(e) => {
                          const updatedPrompts = prompts.map(p =>
                            p.id === activePrompt ? { ...p, enabled: e.target.checked } : p
                          );
                          setPrompts(updatedPrompts);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="calendly-label-sm">Enabled</span>
                    </label>
                  </div>
                </div>

                {/* Channel Selection (for Slack templates) */}
                {activePromptData.type === 'slack_template' && (
                  <div className="mb-6">
                    <label className="calendly-label font-medium mb-2 block">Slack Channel</label>
                    <select
                      value={editingChannel}
                      onChange={(e) => setEditingChannel(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                    >
                      <option value="#product-updates">#product-updates</option>
                      <option value="#customer-insights">#customer-insights</option>
                      <option value="#content-approvals">#content-approvals</option>
                      <option value="#content-pipeline">#content-pipeline</option>
                    </select>
                  </div>
                )}

                {/* System Instructions (for AI prompts) */}
                {activePromptData.type !== 'slack_template' && (
                  <div className="mb-6">
                    <label className="calendly-label font-medium mb-2 block">System Instructions</label>
                    <textarea
                      value={editingSystemInstructions}
                      onChange={(e) => setEditingSystemInstructions(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none calendly-body"
                      rows={3}
                      placeholder="System instructions that define the AI's role and behavior..."
                    />
                  </div>
                )}

                {/* Template Editor */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="calendly-label font-medium">
                      {activePromptData.type === 'slack_template' ? 'Message Template' : 'Prompt Template'}
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="calendly-label-sm text-gray-500">
                        Variables: {activePromptData.variables.join(', ')}
                      </span>
                    </div>
                  </div>
                  <textarea
                    value={editingTemplate}
                    onChange={(e) => setEditingTemplate(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg resize-none calendly-body font-mono text-sm"
                    rows={activePromptData.type === 'slack_template' ? 12 : 20}
                    placeholder={`Enter your ${activePromptData.type === 'slack_template' ? 'message template' : 'AI prompt'}...`}
                  />
                </div>

                {/* Parameters (for AI prompts) */}
                {activePromptData.type !== 'slack_template' && (
                  <div className="mb-6">
                    <label className="calendly-label font-medium mb-2 block">AI Parameters</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="calendly-label-sm mb-1 block">Temperature</label>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.1"
                          value={editingParameters.temperature || 0.5}
                          onChange={(e) => setEditingParameters({
                            ...editingParameters,
                            temperature: parseFloat(e.target.value)
                          })}
                          className="w-full p-2 border border-gray-300 rounded calendly-body"
                        />
                      </div>
                      <div>
                        <label className="calendly-label-sm mb-1 block">Max Tokens</label>
                        <input
                          type="number"
                          min="100"
                          max="4000" 
                          step="100"
                          value={editingParameters.maxTokens || 1000}
                          onChange={(e) => setEditingParameters({
                            ...editingParameters,
                            maxTokens: parseInt(e.target.value)
                          })}
                          className="w-full p-2 border border-gray-300 rounded calendly-body"
                        />
                      </div>
                      <div>
                        <label className="calendly-label-sm mb-1 block">Model</label>
                        <select
                          value={editingParameters.model || 'claude-3-5-sonnet-20241022'}
                          onChange={(e) => setEditingParameters({
                            ...editingParameters,
                            model: e.target.value
                          })}
                          className="w-full p-2 border border-gray-300 rounded calendly-body"
                        >
                          <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                          <option value="gpt-4">GPT-4</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Test Result */}
                {testResult && (
                  <div className={`p-4 rounded-lg border mb-6 ${
                    testResult.success 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {testResult.success ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                      <span className="calendly-body font-medium">{testResult.message}</span>
                    </div>
                    {testResult.preview && (
                      <p className="calendly-body-sm">{testResult.preview}</p>
                    )}
                    {testResult.error && (
                      <p className="calendly-body-sm">{testResult.error}</p>
                    )}
                  </div>
                )}

                {/* Unsaved Changes Warning */}
                {hasUnsavedChanges && (
                  <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-800 mb-6">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="calendly-body">You have unsaved changes</span>
                    </div>
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