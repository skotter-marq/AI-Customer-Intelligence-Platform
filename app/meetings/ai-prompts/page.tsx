'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bot, 
  Save, 
  RotateCcw, 
  TestTube, 
  FileText, 
  Settings, 
  AlertCircle,
  CheckCircle,
  Edit3,
  Copy,
  History,
  Play,
  MessageSquare
} from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  version: string;
  lastModified: string;
  category: 'analysis' | 'insights' | 'actions' | 'sentiment';
}

export default function MeetingAIPromptsPage() {
  const router = useRouter();
  const [activeTemplate, setActiveTemplate] = useState<string>('meeting-analysis');
  const [editingPrompt, setEditingPrompt] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingPrompt, setIsTestingPrompt] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Meeting-specific prompt templates
  const defaultTemplates: PromptTemplate[] = [
    {
      id: 'meeting-analysis',
      name: 'Meeting Analysis',
      description: 'Main prompt for analyzing meeting transcripts and extracting insights',
      category: 'analysis',
      version: '1.0',
      lastModified: new Date().toISOString(),
      prompt: `You are an AI customer intelligence analyst. Analyze this meeting transcript and extract actionable insights.

Meeting Context:
- Title: {title}
- Customer: {customer}  
- Duration: {duration}
- Meeting Type: {meetingType}

Transcript:
{transcript}

Please provide a comprehensive analysis in this JSON format:
{
  "overall_analysis": {
    "sentiment_score": 0.0-1.0,
    "sentiment_label": "positive|neutral|negative", 
    "confidence_score": 0.0-1.0,
    "summary": "2-3 sentence meeting summary",
    "meeting_outcome": "sales_progression|support_escalation|feature_discussion|relationship_building"
  },
  "insights": [
    {
      "type": "pain_point|feature_request|positive_feedback|opportunity|concern",
      "category": "product|technical|commercial|relationship",
      "title": "Brief insight title",
      "description": "Detailed description",
      "quote": "Relevant quote from transcript",
      "importance_score": 0.0-1.0,
      "confidence_score": 0.0-1.0,
      "priority": "high|medium|low",
      "tags": ["relevant", "tags"],
      "affected_feature": "feature name if applicable"
    }
  ],
  "action_items": [
    {
      "description": "What needs to be done",
      "assigned_to": "role or person",
      "priority": "high|medium|low",
      "category": "sales|technical|relationship|admin",
      "due_timeframe": "immediate|this_week|this_month"
    }
  ],
  "feature_requests": [
    {
      "title": "Feature name",
      "description": "What the customer wants",
      "business_value": "Why it matters",
      "urgency": "high|medium|low",
      "customer_pain_point": "Current problem",
      "estimated_impact": "Potential impact"
    }
  ],
  "competitive_intelligence": [
    {
      "competitor": "Competitor name",
      "mention_type": "comparison|switching|evaluation",
      "context": "How they were mentioned",
      "sentiment": "positive|neutral|negative",
      "threat_level": "high|medium|low",
      "quote": "Relevant quote"
    }
  ],
  "customer_health": {
    "satisfaction_level": "high|medium|low",
    "churn_risk": "high|medium|low", 
    "expansion_opportunity": "high|medium|low"
  }
}

Focus on:
1. Extracting specific, actionable insights
2. Identifying customer pain points and requests
3. Noting competitive mentions
4. Assessing customer relationship health
5. Generating concrete follow-up actions`
    },
    {
      id: 'sentiment-analysis',
      name: 'Sentiment Analysis',
      description: 'Specialized prompt for sentiment and emotion detection in meetings',
      category: 'sentiment',
      version: '1.0',
      lastModified: new Date().toISOString(),
      prompt: `Analyze the sentiment and emotional tone of this meeting transcript.

Meeting: {title}
Customer: {customer}
Transcript: {transcript}

Provide detailed sentiment analysis:
{
  "overall_sentiment": {
    "score": 0.0-1.0,
    "label": "positive|neutral|negative",
    "confidence": 0.0-1.0
  },
  "emotion_indicators": [
    {
      "emotion": "frustration|excitement|concern|satisfaction|confusion",
      "intensity": "high|medium|low",
      "evidence": "quote supporting this emotion",
      "context": "what triggered this emotion"
    }
  ],
  "tone_shifts": [
    {
      "timestamp_context": "early|middle|late in meeting",
      "from_tone": "previous emotional state",
      "to_tone": "new emotional state", 
      "trigger": "what caused the shift"
    }
  ],
  "relationship_health": {
    "trust_level": "high|medium|low",
    "engagement_level": "high|medium|low",
    "satisfaction_trend": "improving|stable|declining"
  }
}`
    },
    {
      id: 'action-extraction',
      name: 'Action Item Extraction',
      description: 'Prompt focused on identifying follow-up actions and tasks from meetings',
      category: 'actions',
      version: '1.0',
      lastModified: new Date().toISOString(),
      prompt: `Extract all action items, commitments, and follow-up tasks from this meeting transcript.

Meeting: {title}
Customer: {customer}
Transcript: {transcript}

Identify and categorize all actions:
{
  "immediate_actions": [
    {
      "action": "What needs to be done",
      "owner": "Who is responsible",
      "deadline": "When it's due",
      "priority": "high|medium|low"
    }
  ],
  "commitments_made": [
    {
      "commitment": "What was promised",
      "made_by": "Who made the commitment",
      "to_whom": "Who it was made to",
      "timeline": "When it should be delivered"
    }
  ],
  "follow_up_meetings": [
    {
      "purpose": "Why the meeting is needed",
      "participants": "Who should attend",
      "timeline": "When it should happen"
    }
  ],
  "information_requests": [
    {
      "request": "What information is needed",
      "requested_by": "Who asked for it",
      "purpose": "Why they need it"
    }
  ]
}`
    },
    {
      id: 'feature-extraction',
      name: 'Feature Request Extraction',
      description: 'Specialized prompt for identifying product feature requests from meetings',
      category: 'insights',
      version: '1.0',
      lastModified: new Date().toISOString(),
      prompt: `Analyze this meeting transcript specifically for product feature requests, improvements, and enhancement opportunities.

Meeting: {title}
Customer: {customer}
Transcript: {transcript}

Extract all product-related requests:
{
  "explicit_requests": [
    {
      "feature": "Specific feature name",
      "description": "What the customer wants",
      "use_case": "How they would use it",
      "business_impact": "Why it matters to them",
      "urgency": "high|medium|low",
      "quote": "Direct quote from customer"
    }
  ],
  "implicit_needs": [
    {
      "pain_point": "Current problem they face",
      "potential_solution": "What could solve it",
      "feature_category": "ui|integration|analytics|automation|etc",
      "evidence": "What in the transcript suggests this need"
    }
  ],
  "competitive_gaps": [
    {
      "competitor_feature": "What competitor has",
      "our_gap": "What we're missing",
      "customer_preference": "What customer said about it"
    }
  ],
  "enhancement_opportunities": [
    {
      "current_feature": "Existing feature mentioned",
      "suggested_improvement": "How it could be better",
      "customer_feedback": "What they said about current state"
    }
  ]
}`
    }
  ];

  const [templates, setTemplates] = useState<PromptTemplate[]>(defaultTemplates);

  useEffect(() => {
    // Load saved templates from localStorage
    const saved = localStorage.getItem('meeting-ai-prompt-templates');
    if (saved) {
      try {
        const parsedTemplates = JSON.parse(saved);
        setTemplates(parsedTemplates);
      } catch (e) {
        console.error('Failed to load saved templates:', e);
      }
    }
  }, []);

  useEffect(() => {
    const currentTemplate = templates.find(t => t.id === activeTemplate);
    if (currentTemplate) {
      setEditingPrompt(currentTemplate.prompt);
      setHasUnsavedChanges(false);
    }
  }, [activeTemplate, templates]);

  const handlePromptChange = (value: string) => {
    setEditingPrompt(value);
    const currentTemplate = templates.find(t => t.id === activeTemplate);
    setHasUnsavedChanges(currentTemplate?.prompt !== value);
  };

  const savePrompt = async () => {
    setIsSaving(true);
    try {
      const updatedTemplates = templates.map(template => 
        template.id === activeTemplate 
          ? { 
              ...template, 
              prompt: editingPrompt,
              lastModified: new Date().toISOString(),
              version: incrementVersion(template.version)
            }
          : template
      );
      
      setTemplates(updatedTemplates);
      localStorage.setItem('meeting-ai-prompt-templates', JSON.stringify(updatedTemplates));
      setHasUnsavedChanges(false);
      
      // Show success message briefly, then redirect
      setTimeout(() => {
        setIsSaving(false);
      }, 800);
      
      // Redirect back to meetings after successful save
      setTimeout(() => {
        router.push('/meetings');
      }, 1200);
    } catch (error) {
      console.error('Failed to save prompt:', error);
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
    const defaultTemplate = defaultTemplates.find(t => t.id === activeTemplate);
    if (defaultTemplate) {
      setEditingPrompt(defaultTemplate.prompt);
      setHasUnsavedChanges(true);
    }
  };

  const testPrompt = async () => {
    setIsTestingPrompt(true);
    try {
      // Use sample meeting data for testing
      const sampleData = {
        title: "Product Demo - Sample Corp",
        customer: "Sample Corp",
        duration: "45 minutes",
        meetingType: "demo",
        transcript: "This is a sample transcript for testing the prompt. The customer expressed interest in our analytics features and mentioned they're currently using Salesforce. They had some concerns about pricing but overall seemed positive about the platform."
      };

      const response = await fetch('/api/test-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: editingPrompt,
          sampleData
        })
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      console.error('Prompt test failed:', error);
      setTestResult({ error: 'Test failed' });
    } finally {
      setIsTestingPrompt(false);
    }
  };

  const incrementVersion = (version: string): string => {
    const parts = version.split('.');
    const minor = parseInt(parts[1] || '0') + 1;
    return `${parts[0]}.${minor}`;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'analysis': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'sentiment': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'actions': return 'bg-green-100 text-green-800 border-green-300';
      case 'insights': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const currentTemplate = templates.find(t => t.id === activeTemplate);

  return (
    <div className="min-h-screen pt-4" style={{ background: '#f8fafc' }}>
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Admin Settings', href: '/admin/settings' },
          { label: 'AI Prompts', current: true }
        ]} 
      />

      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div style={{ marginBottom: '16px' }}>
            <h1 className="calendly-h2">Meeting AI Prompts</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template Selector */}
            <div className="lg:col-span-1">
              <div className="calendly-card">
                <h3 className="calendly-h3 flex items-center space-x-2" style={{ marginBottom: '16px' }}>
                  <Settings className="w-5 h-5" />
                  <span>Prompt Templates</span>
                </h3>
                
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
                      <div className="flex items-center justify-between mt-2">
                        <span className="calendly-label-sm text-gray-500">v{template.version}</span>
                        <span className="calendly-label-sm text-gray-500">
                          {new Date(template.lastModified).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Prompt Editor */}
            <div className="lg:col-span-2">
              <div className="calendly-card">
                <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                  <div>
                    <h3 className="calendly-h3 flex items-center space-x-2">
                      <Edit3 className="w-5 h-5" />
                      <span>Edit Prompt: {currentTemplate?.name}</span>
                    </h3>
                    <p className="calendly-body-sm text-gray-600">{currentTemplate?.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={resetToDefault}
                      className="calendly-btn-ghost flex items-center space-x-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset</span>
                    </button>
                    
                    <button
                      onClick={() => navigator.clipboard.writeText(editingPrompt)}
                      className="calendly-btn-ghost flex items-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="calendly-label" style={{ marginBottom: '8px', display: 'block' }}>
                      Prompt Template
                    </label>
                    <textarea
                      value={editingPrompt}
                      onChange={(e) => handlePromptChange(e.target.value)}
                      className="w-full p-4 calendly-body-sm rounded-lg resize-none font-mono"
                      style={{ 
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        minHeight: '300px'
                      }}
                      placeholder="Enter your custom AI prompt here..."
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="calendly-label-sm text-blue-800">
                        Available variables: {'{title}'}, {'{customer}'}, {'{duration}'}, {'{meetingType}'}, {'{transcript}'}
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
                        onClick={testPrompt}
                        disabled={isTestingPrompt}
                        className="calendly-btn-secondary flex items-center space-x-2"
                      >
                        {isTestingPrompt ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <span>Test Prompt</span>
                      </button>
                      
                      <button
                        onClick={savePrompt}
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

              {/* Test Results */}
              {testResult && (
                <div className="calendly-card mt-6">
                  <h3 className="calendly-h3 flex items-center space-x-2" style={{ marginBottom: '16px' }}>
                    <TestTube className="w-5 h-5" />
                    <span>Test Results</span>
                  </h3>
                  
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <pre className="calendly-body-sm font-mono whitespace-pre-wrap overflow-auto">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}