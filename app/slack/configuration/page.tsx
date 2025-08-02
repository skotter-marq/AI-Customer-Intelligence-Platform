'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
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
  Hash,
  Users,
  Bell,
  Zap,
  Bot,
  Slack
} from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';

interface SlackTemplate {
  id: string;
  name: string;
  description: string;
  channel: string;
  messageTemplate: string;
  enabled: boolean;
  triggerEvent: string;
  lastModified: string;
  category: 'approval' | 'notification' | 'summary' | 'alert';
}

export default function SlackConfigurationPage() {
  const router = useRouter();
  const [activeTemplate, setActiveTemplate] = useState<string>('approval-request');
  const [editingTemplate, setEditingTemplate] = useState<string>('');
  const [editingChannel, setEditingChannel] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingMessage, setIsTestingMessage] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Slack message templates
  const defaultTemplates: SlackTemplate[] = [
    {
      id: 'approval-request',
      name: 'Content Approval Request',
      description: 'Message sent when content needs approval',
      category: 'approval',
      channel: '#content-approvals',
      enabled: true,
      triggerEvent: 'content_pending_approval',
      lastModified: new Date().toISOString(),
      messageTemplate: `🔍 **New Content Ready for Review**

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
    },
    {
      id: 'product-update-notification',
      name: 'Product Update Published',
      description: 'Message sent when a product update is published',
      category: 'notification',
      channel: '#product-updates',
      enabled: true,
      triggerEvent: 'product_update_published',
      lastModified: new Date().toISOString(),
      messageTemplate: `📋 **CHANGELOG UPDATE**

**{updateTitle}** is now live

{updateDescription}{whatsNewSection}

👉 *View Details*

{mediaResources}`
    },
    {
      id: 'daily-summary',
      name: 'Daily Pipeline Summary',
      description: 'Daily summary of content pipeline activity',
      category: 'summary',
      channel: '#product-updates',
      enabled: true,
      triggerEvent: 'daily_summary',
      lastModified: new Date().toISOString(),
      messageTemplate: `📊 **Daily Content Pipeline Summary**

**Today's Activity:**
• Content Generated: {totalGenerated}
• Pending Approval: {pendingApproval}
• Published: {published}
• Average Quality: {avgQuality}%

**JIRA Updates:**
• New Customer Stories: {newStories}
• Completed Features: {completedFeatures}

**Top Performing Content:**
{topContent}

[View Dashboard]({dashboardUrl}) | [Weekly Report]({reportUrl})`
    },
    {
      id: 'customer-insight-alert',
      name: 'High-Priority Customer Insight',
      description: 'Alert for high-priority customer insights from meetings',
      category: 'alert',
      channel: '#customer-insights',
      enabled: true,
      triggerEvent: 'high_priority_insight',
      lastModified: new Date().toISOString(),
      messageTemplate: `🚨 **High-Priority Customer Insight Detected**

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
    }
  ];

  const [templates, setTemplates] = useState<SlackTemplate[]>(defaultTemplates);

  useEffect(() => {
    const template = templates.find(t => t.id === activeTemplate);
    if (template) {
      setEditingTemplate(template.messageTemplate);
      setEditingChannel(template.channel);
    }
  }, [activeTemplate, templates]);

  useEffect(() => {
    const template = templates.find(t => t.id === activeTemplate);
    if (template) {
      const hasChanges = 
        editingTemplate !== template.messageTemplate || 
        editingChannel !== template.channel;
      setHasUnsavedChanges(hasChanges);
    }
  }, [editingTemplate, editingChannel, activeTemplate, templates]);

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    try {
      const updatedTemplates = templates.map(template => 
        template.id === activeTemplate
          ? { 
              ...template, 
              messageTemplate: editingTemplate,
              channel: editingChannel,
              lastModified: new Date().toISOString() 
            }
          : template
      );
      
      setTemplates(updatedTemplates);
      
      // Save to backend
      const response = await fetch('/api/slack/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: activeTemplate,
          messageTemplate: editingTemplate,
          channel: editingChannel
        })
      });

      if (response.ok) {
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestMessage = async () => {
    setIsTestingMessage(true);
    try {
      const response = await fetch('/api/slack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_template',
          templateId: activeTemplate,
          messageTemplate: editingTemplate,
          channel: editingChannel,
          testData: getTestData(activeTemplate)
        })
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setIsTestingMessage(false);
    }
  };

  const getTestData = (templateId: string) => {
    const testDataMap: { [key: string]: any } = {
      'approval-request': {
        contentTitle: 'New Product Feature: Advanced Analytics Dashboard',
        contentType: 'Product Update',
        qualityScore: 92,
        createdDate: new Date().toLocaleDateString(),
        contentSummary: 'Added comprehensive analytics dashboard with real-time metrics and custom reporting capabilities.',
        contentUrl: 'http://localhost:3000/approval/123',
        dashboardUrl: 'http://localhost:3000/approval'
      },
      'product-update-notification': {
        updateTitle: 'Advanced Analytics Dashboard',
        jiraKey: 'PRESS-789',
        assignee: 'Development Team',
        updateDescription: 'New analytics dashboard with real-time metrics, custom reports, and data export functionality.',
        customerImpact: 'Customers can now view detailed usage analytics and create custom reports for better insights.',
        changelogUrl: 'http://localhost:3000/changelog',
        templateUrl: 'http://localhost:3000/templates/update-communication',
        jiraUrl: 'https://marq.atlassian.net/browse/PRESS-789'
      },
      'daily-summary': {
        totalGenerated: 8,
        pendingApproval: 3,
        published: 5,
        avgQuality: 87,
        newStories: 4,
        completedFeatures: 2,
        topContent: '• Product Update: Analytics Dashboard (95% quality)\n• Bug Fix: Export Functionality (89% quality)',
        dashboardUrl: 'http://localhost:3000/dashboard',
        reportUrl: 'http://localhost:3000/reports/weekly'
      },
      'customer-insight-alert': {
        customerName: 'TechCorp Solutions',
        meetingTitle: 'Quarterly Business Review',
        insightType: 'Feature Request',
        priorityScore: 9,
        insightSummary: 'Customer urgently needs bulk data export functionality for compliance reporting',
        actionItems: '• Create JIRA ticket for bulk export feature\n• Schedule technical discovery call\n• Provide timeline estimate',
        customerQuote: 'We really need a way to export all our data at once for our quarterly compliance reports. This is becoming a blocker for us.',
        meetingUrl: 'http://localhost:3000/meetings/123',
        jiraCreateUrl: 'https://marq.atlassian.net/secure/CreateIssue.jspa'
      }
    };
    return testDataMap[templateId] || {};
  };

  const handleResetTemplate = () => {
    const originalTemplate = defaultTemplates.find(t => t.id === activeTemplate);
    if (originalTemplate) {
      setEditingTemplate(originalTemplate.messageTemplate);
      setEditingChannel(originalTemplate.channel);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'approval': return <CheckCircle className="w-4 h-4" />;
      case 'notification': return <Bell className="w-4 h-4" />;
      case 'summary': return <MessageSquare className="w-4 h-4" />;
      case 'alert': return <Zap className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'approval': return 'text-blue-600 bg-blue-50';
      case 'notification': return 'text-green-600 bg-green-50';
      case 'summary': return 'text-purple-600 bg-purple-50';
      case 'alert': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };


  const activeTemplateData = templates.find(t => t.id === activeTemplate);

  return (
    <div className="min-h-screen pt-4" style={{ background: '#f8fafc' }}>
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Admin Settings', href: '/admin/settings' },
          { label: 'Slack Configuration', current: true }
        ]} 
      />

      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div style={{ marginBottom: '16px' }}>
            <h1 className="calendly-h2">Slack Configuration</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template List */}
            <div className="lg:col-span-1">
              <div className="calendly-card">
                <h3 className="calendly-h3 flex items-center space-x-2" style={{ marginBottom: '16px' }}>
                  <Settings className="w-5 h-5" />
                  <span>Message Templates</span>
                </h3>
                <p className="calendly-body-sm text-gray-600" style={{ marginBottom: '16px' }}>Choose a template to edit</p>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setActiveTemplate(template.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        activeTemplate === template.id
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between" style={{ marginBottom: '8px' }}>
                        <h4 className="calendly-body font-medium">{template.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs border ${getCategoryColor(template.category)}`}>
                          {template.category}
                        </span>
                      </div>
                      <p className="calendly-label-sm text-gray-600">{template.description}</p>
                      <div className="flex items-center mt-2 calendly-label-sm text-gray-500">
                        <Hash className="w-3 h-3 mr-1" />
                        {template.channel}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Template Editor */}
            <div className="lg:col-span-2">
              <div className="calendly-card">
                <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                  <div>
                    <h3 className="calendly-h3 flex items-center space-x-2">
                      <Edit3 className="w-5 h-5" />
                      <span>Edit Template: {activeTemplateData?.name}</span>
                    </h3>
                    <p className="calendly-body-sm text-gray-600">{activeTemplateData?.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleResetTemplate}
                      className="calendly-btn-ghost flex items-center space-x-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Channel Configuration */}
                  <div>
                    <label className="calendly-label" style={{ marginBottom: '8px', display: 'block' }}>
                      Slack Channel
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={editingChannel}
                        onChange={(e) => setEditingChannel(e.target.value)}
                        placeholder="channel-name"
                        className="w-full pl-10 pr-4 py-2 calendly-body-sm rounded-lg"
                        style={{ 
                          border: '1px solid #e2e8f0',
                          background: 'white'
                        }}
                      />
                    </div>
                    <p className="calendly-label-sm text-gray-500 mt-1">
                      The Slack channel where this message will be sent
                    </p>
                  </div>

                  {/* Message Template */}
                  <div>
                    <label className="calendly-label" style={{ marginBottom: '8px', display: 'block' }}>
                      Message Template
                    </label>
                    <textarea
                      value={editingTemplate}
                      onChange={(e) => setEditingTemplate(e.target.value)}
                      className="w-full p-4 calendly-body-sm rounded-lg resize-none font-mono"
                      style={{ 
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        minHeight: '200px',
                        maxHeight: '250px'
                      }}
                      placeholder="Enter your Slack message template..."
                    />
                    <p className="calendly-label-sm text-gray-500 mt-1">
                      Use {`{variableName}`} for dynamic content. Available variables depend on the template type.
                    </p>
                  </div>

                  {/* Variable Reference */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-blue-600" />
                      <span className="calendly-label-sm text-blue-800">
                        Available variables: {getAvailableVariables(activeTemplate).map(v => `{${v}}`).join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      {hasUnsavedChanges && (
                        <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="calendly-label-sm text-yellow-700">Unsaved changes</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleTestMessage}
                        disabled={isTestingMessage}
                        className="calendly-btn-secondary flex items-center space-x-2"
                      >
                        {isTestingMessage ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : (
                          <TestTube className="w-4 h-4" />
                        )}
                        <span>Test Message</span>
                      </button>
                      
                      <button
                        onClick={handleSaveTemplate}
                        disabled={!hasUnsavedChanges || isSaving}
                        className="calendly-btn-primary flex items-center space-x-2"
                      >
                        {isSaving ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>{isSaving ? 'Saved!' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className="calendly-card mt-6">
              <h3 className="calendly-h3 flex items-center space-x-2" style={{ marginBottom: '16px' }}>
                <TestTube className="w-5 h-5" />
                <span>Test Results</span>
              </h3>
              
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                {testResult.success ? (
                  <div>
                    <p className="text-green-600 mb-4">✅ Message sent successfully to {testResult.channel}</p>
                    <div className="bg-white rounded-lg p-4 border">
                      <h4 className="calendly-body font-medium mb-2">Message Preview:</h4>
                      <div className="whitespace-pre-wrap calendly-body-sm text-gray-700">
                        {testResult.previewMessage}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-600">❌ {testResult.error}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getAvailableVariables(templateId: string): string[] {
  const variableMap: { [key: string]: string[] } = {
    'approval-request': [
      'contentTitle', 'contentType', 'qualityScore', 'createdDate',
      'contentSummary', 'contentUrl', 'dashboardUrl'
    ],
    'product-update-notification': [
      'updateTitle', 'jiraKey', 'assignee', 'updateDescription',
      'customerImpact', 'changelogUrl', 'templateUrl', 'jiraUrl'
    ],
    'daily-summary': [
      'totalGenerated', 'pendingApproval', 'published', 'avgQuality',
      'newStories', 'completedFeatures', 'topContent', 'dashboardUrl', 'reportUrl'
    ],
    'customer-insight-alert': [
      'customerName', 'meetingTitle', 'insightType', 'priorityScore',
      'insightSummary', 'actionItems', 'customerQuote', 'meetingUrl', 'jiraCreateUrl'
    ]
  };
  return variableMap[templateId] || [];
}