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
  FileText,
  MessageSquare,
  Users,
  Zap,
  Eye,
  Slack,
  Hash,
  Bell,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  SortAcs,
  BarChart3,
  Calendar,
  Tag,
  Plus,
  X
} from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';

interface AIPrompt {
  id: string;
  name: string;
  description: string;
  type: 'ai_analysis' | 'content_generation' | 'slack_template';
  category: string;
  usedIn: string[]; // Where this prompt is used
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
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<{[key: string]: any}>({});
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingPrompt, setIsTestingPrompt] = useState(false);
  const [useRealJiraData, setUseRealJiraData] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<{[key: string]: boolean}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  const breadcrumbItems = [
    { label: 'Admin Settings', href: '/admin/settings' },
    { label: 'AI Prompts & Templates', current: true }
  ];

  // State for loading from database
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    type: 'ai_analysis' as 'ai_analysis' | 'slack_template' | 'content_generation',
    category: '',
    template: '',
    systemInstructions: '',
    channel: '#int-product-updates',
    variables: [] as string[]
  });
  const [isCreating, setIsCreating] = useState(false);
  
  // All prompts loaded from database
  const [prompts, setPrompts] = useState<AIPrompt[]>([
    {
      id: 'meeting-analysis',
      name: 'Meeting Transcript Analysis',
      description: 'Extracts customer insights, pain points, and opportunities from meeting transcripts',
      type: 'ai_analysis',
      category: 'Meeting Analysis',
      usedIn: ['Grain webhook processing', 'Manual meeting analysis', 'Customer insight extraction'],
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
      description: 'Analyzes competitive signals and market intelligence data for strategic insights',
      type: 'ai_analysis',
      category: 'Competitive Intelligence',
      usedIn: ['Competitive monitoring workflows', 'Market analysis reports', 'Strategic planning'],
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
    {
      id: 'case-study-generator',
      name: 'Customer Success Story Generator',
      description: 'Generates compelling customer case studies and success stories from meeting insights',
      type: 'content_generation',
      category: 'Marketing Content',
      usedIn: ['Content pipeline creation', 'Marketing automation', 'Sales enablement materials'],
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
      description: 'Creates customer-focused feature announcements from JIRA updates and product data',
      type: 'content_generation',
      category: 'Product Marketing',
      usedIn: ['JIRA webhook automation', 'Product release communications', 'Feature launch campaigns'],
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
    {
      id: 'slack-product-update',
      name: 'Product Update Published',
      description: 'Slack notification sent when product updates are published via JIRA webhooks',
      type: 'slack_template',
      category: 'Product Notifications',
      usedIn: ['JIRA completion webhooks', 'Product team notifications', '#int-product-updates channel'],
      channel: '#int-product-updates',
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
      variables: ['updateTitle', 'updateDescription', 'whatsNewSection', 'mediaResources'],
      template: `📋 **CHANGELOG UPDATE**

**{updateTitle}** is now live

{updateDescription}{whatsNewSection}

👉 *View Details*

{mediaResources}`
    },
    {
      id: 'slack-customer-insight',
      name: 'High-Priority Customer Insight Alert',
      description: 'Slack alert for important customer insights detected from meeting analysis',
      type: 'slack_template',
      category: 'Customer Intelligence',
      usedIn: ['Grain meeting analysis', 'Customer insight workflows', '#product-meeting-insights channel'],
      channel: '#product-meeting-insights',
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
      description: 'Slack notification for content that needs review and approval from stakeholders',
      type: 'slack_template',
      category: 'Content Pipeline',
      usedIn: ['Content pipeline workflows', 'Approval processes', '#product-changelog-approvals channel'],
      channel: '#product-changelog-approvals', 
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
    },
    {
      id: 'slack-jira-story-completed',
      name: 'JIRA Story Completed',
      description: 'Notification when a customer-facing JIRA story is completed and changelog entry is generated',
      type: 'slack_template',
      category: 'Product Notifications',
      usedIn: ['JIRA webhook automation', 'Product completion notifications', '#product-changelog-approvals channel'],
      channel: '#product-changelog-approvals',
      version: '1.0',
      lastModified: '2025-01-30T22:00:00Z',
      usageCount: 5,
      enabled: true,
      triggerEvent: 'jira_story_completed',
      parameters: {
        temperature: 0,
        maxTokens: 500,
        model: 'template'
      },
      variables: ['jiraKey', 'contentTitle', 'category', 'contentSummary', 'assignee', 'qualityScore', 'dashboardUrl', 'jiraUrl'],
      template: `📋 **Changelog Entry Ready for Review**

**{jiraKey}** has been completed and the changelog entry is ready for review.

**Title:** {contentTitle}
**Category:** {category}  
**Assignee:** {assignee}
**Summary:** {contentSummary}

👉 **[Review & Approve in Dashboard]({dashboardUrl})**

Click the link above to review, edit, and approve this changelog entry.

🎫 [View JIRA Ticket]({jiraUrl})

Quality Score: {qualityScore}% | Content ID: [generated]`
    },
    {
      id: 'changelog-generation',
      name: 'JIRA Changelog Generation',
      description: 'Transforms JIRA tickets into customer-friendly changelog entries for product updates',
      type: 'ai_analysis',
      category: 'Product Marketing',
      usedIn: ['JIRA webhook automation', 'Product release workflows', 'Customer communication'],
      version: '1.0',
      lastModified: '2025-01-30T21:45:00Z',
      usageCount: 23,
      enabled: true,
      systemInstructions: 'You are a technical writer creating customer-facing changelog entries from JIRA tickets. Focus on customer benefits and clear, jargon-free language.',
      parameters: {
        temperature: 0.3,
        maxTokens: 1000,
        model: 'claude-3-5-sonnet-20241022'
      },
      variables: ['key', 'summary', 'description', 'priority', 'status', 'components', 'labels', 'reporter', 'assignee'],
      template: `You are a technical writer creating customer-facing changelog entries from JIRA tickets. Transform the following technical JIRA issue into a customer-friendly changelog entry.

JIRA ISSUE:
- Key: {key}
- Summary: {summary}
- Description: {description}
- Priority: {priority}
- Status: {status}
- Components: {components}
- Labels: {labels}
- Reporter: {reporter}
- Assignee: {assignee}

GUIDELINES:
- Write from the customer's perspective using "you" and "your"
- Focus on benefits and value, not technical implementation details
- Use clear, jargon-free language
- Highlight what's improved for the user experience
- Be concise but informative

Generate a changelog entry in the following JSON format:

{
  "customer_title": "Customer-facing title (max 80 characters)",
  "customer_description": "2-3 sentences describing the improvement from customer perspective",
  "highlights": [
    "Key benefit or feature point 1",
    "Key benefit or feature point 2",
    "Key benefit or feature point 3"
  ],
  "category": "added|improved|fixed|security|deprecated",
  "breaking_changes": false,
  "migration_notes": "Only if breaking_changes is true, provide migration guidance",
  "estimated_impact": "low|medium|high",
  "user_segments": ["all_users|enterprise|free_tier|developers|admin"],
  "tldr": "One sentence summary of the change"
}

CATEGORY MAPPING:
- "added" - New features, capabilities, or integrations
- "improved" - Performance, usability, or experience enhancements  
- "fixed" - Bug fixes, error corrections, or stability improvements
- "security" - Security updates, authentication, or privacy improvements
- "deprecated" - Features being sunset or removed

Return only the JSON response, no additional text.`
    },
    {
      id: 'hubspot-data-analysis',
      name: 'HubSpot CRM Data Analysis',
      description: 'Analyzes HubSpot contact and deal data to extract customer lifecycle insights and risk indicators',
      type: 'ai_analysis',
      category: 'Customer Intelligence',
      usedIn: ['HubSpot data sync workflows', 'Customer health scoring', 'CRM insight extraction'],
      version: '1.2',
      lastModified: '2025-01-30T18:20:00Z',
      usageCount: 156,
      enabled: true,
      systemInstructions: 'You are a customer success analyst specializing in CRM data interpretation and customer lifecycle insights.',
      parameters: {
        temperature: 0.3,
        maxTokens: 1500,
        model: 'claude-3-5-sonnet-20241022'
      },
      variables: ['analysisType', 'data'],
      template: `You are analyzing {analysisType} data from HubSpot. Extract insights from the following data:

DATA TYPE: {analysisType}
DATA: {data}

Please provide insights in JSON format, focusing on:
- Customer lifecycle stage changes
- Deal progression patterns
- Support ticket themes
- Engagement patterns
- Risk indicators

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
      "quotes": ["relevant quote from data"]
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
  "summary": "Brief 2-3 sentence summary"
}

Return only the JSON response, no additional text.`
    },
    {
      id: 'tldr-summary-generator',
      name: 'TLDR Summary Generator',
      description: 'Creates concise, engaging summaries of content in various styles and formats',
      type: 'content_generation',
      category: 'Content Pipeline',
      usedIn: ['Content summarization workflows', 'Email campaigns', 'Social media posts'],
      version: '1.4',
      lastModified: '2025-01-30T15:10:00Z',
      usageCount: 89,
      enabled: true,
      systemInstructions: 'You are a skilled content editor specializing in creating compelling, concise summaries that capture the essence of longer content.',
      parameters: {
        temperature: 0.5,
        maxTokens: 800,
        model: 'gpt-4'
      },
      variables: ['tone', 'maxLength', 'format', 'audience', 'content'],
      template: `Please create a {tone} TLDR summary of the following content.

REQUIREMENTS:
- Style: {tone}
- Max Length: {maxLength} words
- Format: {format}
- Target Audience: {audience}

CONTENT:
{content}

STYLE GUIDELINES:
- Professional: Formal, business-focused language
- Casual: Conversational, approachable tone
- Technical: Include relevant technical details
- Executive: High-level strategic focus

Create a compelling TLDR that captures the essence of the content while matching the requested style and length requirements.

Return only the TLDR summary, no additional text.`
    },
    {
      id: 'competitive-tag-detection',
      name: 'Competitive Intelligence Tag Detection',
      description: 'Analyzes content to identify competitive signals and relevant tags for intelligence filtering',
      type: 'ai_analysis',
      category: 'Competitive Intelligence',
      usedIn: ['Content filtering workflows', 'Competitive monitoring', 'Intelligence categorization'],
      version: '1.1',
      lastModified: '2025-01-29T20:30:00Z',
      usageCount: 67,
      enabled: true,
      systemInstructions: 'You are a competitive intelligence analyst focused on identifying relevant signals and categorizing competitive content.',
      parameters: {
        temperature: 0.2,
        maxTokens: 1000,
        model: 'claude-3-5-sonnet-20241022'
      },
      variables: ['content', 'competitors', 'products', 'technologies', 'markets', 'features'],
      template: `Analyze the following content and identify relevant tags for competitive intelligence:

CONTENT:
{content}

AVAILABLE TAG CATEGORIES:
- Competitors: {competitors}
- Products: {products}
- Technologies: {technologies}
- Markets: {markets}
- Features: {features}

Generate tags in JSON format:

{
  "detected_tags": [
    {
      "tag": "Tag name",
      "category": "competitor|product|technology|market|feature|other",
      "confidence": 0.0 to 1.0,
      "evidence": "Text snippet that supports this tag",
      "relevance": "high|medium|low"
    }
  ],
  "primary_topics": ["topic1", "topic2", "topic3"],
  "sentiment": "positive|negative|neutral",
  "content_type": "announcement|review|comparison|case_study|news|other",
  "competitive_signals": [
    {
      "signal_type": "new_feature|pricing_change|partnership|hiring|funding",
      "competitor": "Competitor name if applicable",
      "description": "Description of the signal",
      "impact_level": "high|medium|low"
    }
  ]
}

Return only the JSON response, no additional text.`
    },
    {
      id: 'content-fact-validation',
      name: 'Content Fact Validation',
      description: 'Fact-checks and validates content accuracy, consistency, and compliance before publication',
      type: 'ai_analysis',
      category: 'Content Pipeline',
      usedIn: ['Content approval workflows', 'Quality assurance processes', 'Compliance checking'],
      version: '1.0',
      lastModified: '2025-01-30T13:45:00Z',
      usageCount: 34,
      enabled: true,
      systemInstructions: 'You are a content quality analyst focused on fact-checking, accuracy validation, and compliance verification.',
      parameters: {
        temperature: 0.1,
        maxTokens: 1200,
        model: 'claude-3-5-sonnet-20241022'
      },
      variables: ['content'],
      template: `Please fact-check the following content for accuracy:

CONTENT:
{content}

VALIDATION CRITERIA:
- Factual accuracy
- Data consistency  
- Claim verification
- Source reliability
- Compliance with guidelines

Provide validation results in JSON format:

{
  "overall_score": 0.0 to 1.0,
  "validation_status": "approved|needs_review|rejected",
  "fact_checks": [
    {
      "claim": "Specific claim being checked",
      "status": "verified|unverified|disputed",
      "confidence": 0.0 to 1.0,
      "evidence": "Supporting or contradicting evidence",
      "recommendation": "keep|modify|remove"
    }
  ],
  "accuracy_issues": [
    {
      "issue": "Description of the issue",
      "severity": "high|medium|low",
      "location": "Where in content this appears",
      "suggested_fix": "How to correct this"
    }
  ],
  "compliance_check": {
    "legal_compliance": "compliant|needs_review|non_compliant",
    "brand_guidelines": "compliant|needs_review|non_compliant",
    "factual_accuracy": "accurate|questionable|inaccurate"
  },
  "recommendations": [
    "Specific recommendations for improvement"
  ]
}

Return only the JSON response, no additional text.`
    },
    {
      id: 'follow-up-action-generator',
      name: 'Follow-up Action Generator',
      description: 'Generates specific, actionable follow-up tasks from customer insights and meeting analysis',
      type: 'content_generation',
      category: 'Customer Intelligence',
      usedIn: ['Meeting follow-up workflows', 'Customer success automation', 'Task generation'],
      version: '1.3',
      lastModified: '2025-01-30T10:15:00Z',
      usageCount: 112,
      enabled: true,
      systemInstructions: 'You are a customer success specialist focused on creating actionable, specific follow-up tasks that drive customer outcomes.',
      parameters: {
        temperature: 0.4,
        maxTokens: 1000,
        model: 'gpt-4'
      },
      variables: ['customerContext', 'insights'],
      template: `Based on the following customer insights, generate specific follow-up actions:

CUSTOMER CONTEXT:
{customerContext}

INSIGHTS:
{insights}

Generate follow-up actions in JSON format:
{
  "actions": [
    {
      "type": "email|call|meeting|task|escalation",
      "title": "Action title",
      "description": "Detailed description",
      "priority": "high|medium|low",
      "due_date": "YYYY-MM-DD",
      "assigned_to": "role or person",
      "related_insights": ["insight_id1", "insight_id2"]
    }
  ]
}

Focus on actionable, specific recommendations that address the insights.
Return only the JSON response.`
    }
  ]);

  // Load prompts from database on component mount
  useEffect(() => {
    loadPromptsFromDatabase();
  }, []);

  const loadPromptsFromDatabase = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      
      const response = await fetch('/api/admin/prompts?type=all');
      if (!response.ok) {
        throw new Error(`Failed to load prompts: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load prompts');
      }
      
      // Transform database data to UI format
      const transformedPrompts: AIPrompt[] = [];
      
      // Add AI prompts
      if (result.data.ai_prompts) {
        result.data.ai_prompts.forEach((prompt: any) => {
          transformedPrompts.push({
            id: prompt.id,
            name: prompt.name,
            description: prompt.description || '',
            type: 'ai_analysis',
            category: prompt.category,
            usedIn: Array.isArray(prompt.used_in) ? prompt.used_in : [],
            template: prompt.user_prompt_template || '',
            systemInstructions: prompt.system_instructions || '',
            parameters: typeof prompt.parameters === 'object' ? prompt.parameters : {
              temperature: 0.3,
              maxTokens: 2000,
              model: 'claude-3-5-sonnet-20241022'
            },
            variables: Array.isArray(prompt.variables) ? prompt.variables : [],
            enabled: prompt.enabled !== false,
            version: prompt.version || '1.0',
            lastModified: prompt.updated_at || prompt.created_at,
            usageCount: prompt.usage_count || 0
          });
        });
      }
      
      // Add Slack templates
      if (result.data.slack_templates) {
        result.data.slack_templates.forEach((template: any) => {
          transformedPrompts.push({
            id: template.id,
            name: template.name,
            description: template.description || '',
            type: 'slack_template',
            category: template.category,
            usedIn: [`${template.channel} channel`, template.trigger_event || 'Manual trigger'].filter(Boolean),
            template: template.message_template || '',
            channel: template.channel || '',
            triggerEvent: template.trigger_event || '',
            parameters: {
              temperature: 0,
              maxTokens: 500,
              model: 'template'
            },
            variables: Array.isArray(template.variables) ? template.variables : [],
            enabled: template.enabled !== false,
            version: '1.0',
            lastModified: template.updated_at || template.created_at,
            usageCount: template.usage_count || 0
          });
        });
      }
      
      // System messages are excluded from this interface
      // They are managed separately and don't need to be displayed here
      
      setPrompts(transformedPrompts);
      console.log(`✅ Loaded ${transformedPrompts.length} prompts from database`);
      
    } catch (error) {
      console.error('❌ Failed to load prompts:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load prompts');
      // Keep existing hardcoded data as fallback
    } finally {
      setIsLoading(false);
    }
  };

  const typeOptions = [
    { value: 'all', label: 'All Types', count: 0 },
    { value: 'ai_analysis', label: 'AI Analysis', count: 0 },
    { value: 'content_generation', label: 'Content Generation', count: 0 },
    { value: 'slack_template', label: 'Slack Templates', count: 0 }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'Meeting Analysis', label: 'Meeting Analysis' },
    { value: 'Competitive Intelligence', label: 'Competitive Intelligence' },
    { value: 'Marketing Content', label: 'Marketing Content' },
    { value: 'Product Marketing', label: 'Product Marketing' },
    { value: 'Product Notifications', label: 'Product Notifications' },
    { value: 'Customer Intelligence', label: 'Customer Intelligence' },
    { value: 'Content Pipeline', label: 'Content Pipeline' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'usage', label: 'Usage Count' },
    { value: 'modified', label: 'Last Modified' },
    { value: 'type', label: 'Type' },
    { value: 'category', label: 'Category' }
  ];

  // Update counts
  const updatedTypeOptions = typeOptions.map(option => ({
    ...option,
    count: option.value === 'all' 
      ? prompts.length 
      : prompts.filter(p => p.type === option.value).length
  }));

  // Filter and sort prompts
  const filteredPrompts = prompts
    .filter(prompt => {
      const matchesSearch = prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prompt.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || prompt.type === selectedType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'modified':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleExpand = (promptId: string) => {
    if (expandedPrompt === promptId) {
      setExpandedPrompt(null);
    } else {
      setExpandedPrompt(promptId);
      const prompt = prompts.find(p => p.id === promptId);
      if (prompt) {
        setEditingData({
          [promptId]: {
            template: prompt.template,
            systemInstructions: prompt.systemInstructions || '',
            channel: prompt.channel || '',
            parameters: prompt.parameters
          }
        });
      }
    }
  };

  const updateEditingData = (promptId: string, field: string, value: any) => {
    setEditingData(prev => ({
      ...prev,
      [promptId]: {
        ...prev[promptId],
        [field]: value
      }
    }));

    // Check for unsaved changes
    const prompt = prompts.find(p => p.id === promptId);
    const currentData = editingData[promptId] || {};
    const hasChanges = 
      currentData.template !== prompt?.template ||
      currentData.systemInstructions !== (prompt?.systemInstructions || '') ||
      currentData.channel !== (prompt?.channel || '') ||
      JSON.stringify(currentData.parameters) !== JSON.stringify(prompt?.parameters);
    
    setHasUnsavedChanges(prev => ({
      ...prev,
      [promptId]: hasChanges
    }));
  };

  const handleSave = async (promptId: string) => {
    setIsSaving(true);
    try {
      const prompt = prompts.find(p => p.id === promptId);
      const currentData = editingData[promptId];
      
      if (!prompt || !currentData) {
        throw new Error('Prompt data not found');
      }
      
      // Determine which table to update based on prompt type
      let table: string;
      let updateData: any;
      
      if (prompt.type === 'ai_analysis') {
        table = 'ai_prompts';
        updateData = {
          system_instructions: currentData.systemInstructions || '',
          user_prompt_template: currentData.template || '',
          parameters: currentData.parameters || prompt.parameters
        };
      } else if (prompt.type === 'slack_template') {
        table = 'slack_templates';
        updateData = {
          message_template: currentData.template || '',
          channel: currentData.channel || ''
        };
      } else {
        table = 'system_messages';
        updateData = {
          message_template: currentData.template || ''
        };
      }
      
      // Save to database
      const response = await fetch('/api/admin/prompts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table,
          id: promptId,
          data: updateData
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Save failed');
      }
      
      // Update local state with saved data
      const updatedPrompts = prompts.map(p => 
        p.id === promptId 
          ? {
              ...p,
              ...currentData,
              lastModified: new Date().toISOString()
            }
          : p
      );
      
      setPrompts(updatedPrompts);
      setHasUnsavedChanges(prev => ({ ...prev, [promptId]: false }));
      
      console.log('✅ Prompt saved successfully:', promptId);
      
      // Show success feedback
      setTestResult({
        success: true,
        message: 'Changes saved successfully!',
        preview: 'Your changes have been saved to the database and are now live.'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setTestResult(null), 3000);
      
    } catch (error) {
      console.error('❌ Save failed:', error);
      setTestResult({
        success: false,
        message: 'Save failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (prompt) {
      setEditingData(prev => ({
        ...prev,
        [promptId]: {
          template: prompt.template,
          systemInstructions: prompt.systemInstructions || '',
          channel: prompt.channel || '',
          parameters: prompt.parameters
        }
      }));
      setHasUnsavedChanges(prev => ({ ...prev, [promptId]: false }));
    }
  };

  const handleTest = async (promptId: string) => {
    setIsTestingPrompt(true);
    setTestResult(null);
    
    try {
      const prompt = prompts.find(p => p.id === promptId);
      const currentData = editingData[promptId];
      
      if (!prompt) {
        throw new Error('Prompt not found');
      }
      
      // Prepare template data for testing
      let templateData: any = {};
      let templateType = '';
      
      if (prompt.type === 'slack_template') {
        templateType = 'slack_template';
        templateData = {
          message_template: currentData?.template || prompt.template,
          variables: prompt.variables,
          channel: currentData?.channel || prompt.channel
        };
      } else if (prompt.type === 'ai_analysis') {
        templateType = 'ai_analysis';
        templateData = {
          user_prompt_template: currentData?.template || prompt.template,
          system_instructions: currentData?.systemInstructions || prompt.systemInstructions,
          variables: prompt.variables,
          parameters: currentData?.parameters || prompt.parameters
        };
      } else {
        templateType = 'system_message';
        templateData = {
          message_template: currentData?.template || prompt.template,
          variables: prompt.variables
        };
      }
      
      // Call the testing API
      const response = await fetch('/api/admin/test-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateType,
          templateId: promptId,
          templateData,
          useRealData: useRealJiraData
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Test failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Test failed');
      }
      
      // Enhanced test result display
      let displayMessage = result.message;
      let displayPreview = result.preview;
      
      if (result.details) {
        const details = result.details;
        
        if (templateType === 'slack_template') {
          displayPreview += `\n\n📊 Test Details:\n• Channel: ${details.channel}\n• Length: ${details.messageLength} chars\n• Variables used: ${details.usedVariables?.length || 0}/${details.totalVariables || 0}`;
          
          if (details.warnings && details.warnings.length > 0) {
            displayPreview += `\n\n⚠️ Warnings:\n${details.warnings.map((w: string) => `• ${w}`).join('\n')}`;
          }
        } else if (templateType === 'ai_analysis') {
          displayPreview += `\n\n📊 Quality Analysis:\n• Template: ${details.validations?.templateLength} characters\n• Variables: ${details.variablesInTemplate?.length}/${details.validations?.variableCount} used\n• Est. tokens: ~${details.estimatedTokens}`;
          
          if (details.recommendations && details.recommendations.length > 0) {
            displayPreview += `\n\n💡 Recommendations:\n${details.recommendations.map((r: string) => `• ${r}`).join('\n')}`;
          }
        }
      }
      
      setTestResult({
        success: true,
        message: displayMessage,
        preview: displayPreview
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

  const handleCreateNew = async () => {
    setIsCreating(true);
    try {
      // Determine table and data structure
      let table: string;
      let createData: any;
      
      if (createFormData.type === 'ai_analysis') {
        table = 'ai_prompts';
        createData = {
          id: createFormData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: createFormData.name,
          description: createFormData.description,
          category: createFormData.category,
          type: 'ai_analysis',
          system_instructions: createFormData.systemInstructions,
          user_prompt_template: createFormData.template,
          variables: createFormData.variables,
          parameters: {
            temperature: 0.3,
            maxTokens: 2000,
            model: 'claude-3-5-sonnet-20241022'
          },
          used_in: ['Manual creation'],
          version: '1.0',
          enabled: true
        };
      } else if (createFormData.type === 'slack_template') {
        table = 'slack_templates';
        createData = {
          id: createFormData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: createFormData.name,
          description: createFormData.description,
          category: createFormData.category,
          channel: createFormData.channel,
          message_template: createFormData.template,
          variables: createFormData.variables,
          trigger_event: 'manual_trigger',
          webhook_type: createFormData.channel.includes('approval') ? 'approvals' : 'updates',
          enabled: true
        };
      } else {
        table = 'system_messages';
        createData = {
          id: createFormData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: createFormData.name,
          description: createFormData.description,
          category: createFormData.category,
          message_template: createFormData.template,
          variables: createFormData.variables,
          context: 'ui_message',
          enabled: true
        };
      }
      
      // Create in database
      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table,
          data: createData
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Create failed');
      }
      
      // Reload prompts from database
      await loadPromptsFromDatabase();
      
      // Reset form and close modal
      setCreateFormData({
        name: '',
        description: '',
        type: 'ai_analysis',
        category: '',
        template: '',
        systemInstructions: '',
        channel: '#int-product-updates',
        variables: []
      });
      setShowCreateModal(false);
      
      console.log('✅ New prompt created successfully:', result.data.id);
      
      // Show success feedback
      setTestResult({
        success: true,
        message: 'New prompt created successfully!',
        preview: `${createFormData.name} has been created and saved to the database.`
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setTestResult(null), 3000);
      
    } catch (error) {
      console.error('❌ Create failed:', error);
      setTestResult({
        success: false,
        message: 'Failed to create new prompt',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ai_analysis': return Bot;
      case 'content_generation': return FileText;
      case 'slack_template': return Slack;
      default: return Bot;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'ai_analysis': 'text-blue-600 bg-blue-50 border-blue-200',
      'content_generation': 'text-green-600 bg-green-50 border-green-200', 
      'slack_template': 'text-purple-600 bg-purple-50 border-purple-200'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'ai_analysis': 'AI Analysis',
      'content_generation': 'Content Generation',
      'slack_template': 'Slack Template'
    };
    return labels[type as keyof typeof labels] || type;
  };

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
                Manage all AI prompts, content generation templates, and Slack message templates in one place.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="calendly-button calendly-button-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New</span>
            </button>
          </div>

          {/* Filters and Search */}
          <div className="calendly-card mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1">
                <label className="calendly-label-sm mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search prompts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg calendly-body"
                  />
                </div>
              </div>
              
              <div>
                <label className="calendly-label-sm mb-1 block">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                >
                  {updatedTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.count})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="calendly-label-sm mb-1 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4">
            <p className="calendly-body text-gray-600">
              Showing {filteredPrompts.length} of {prompts.length} prompts
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="calendly-card text-center py-12">
              <Settings className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <h3 className="calendly-h3 text-gray-600 mb-2">Loading prompts...</h3>
              <p className="calendly-body text-gray-500">
                Fetching prompts and templates from database...
              </p>
            </div>
          )}
          
          {/* Error State */}
          {loadError && (
            <div className="calendly-card border-red-200 bg-red-50 text-center py-12">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
              <h3 className="calendly-h3 text-red-600 mb-2">Failed to load prompts</h3>
              <p className="calendly-body text-red-700 mb-4">
                {loadError}
              </p>
              <button
                onClick={loadPromptsFromDatabase}
                className="calendly-button calendly-button-primary"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Prompts List */}
          {!isLoading && !loadError && (
            <div className="space-y-4">
            {filteredPrompts.map((prompt) => {
              const Icon = getTypeIcon(prompt.type);
              const isExpanded = expandedPrompt === prompt.id;
              const currentEditingData = editingData[prompt.id] || {};
              const hasChanges = hasUnsavedChanges[prompt.id] || false;
              
              return (
                <div key={prompt.id} className="calendly-card">
                  {/* Prompt Header - Always Visible */}
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-6 p-6 rounded-lg"
                    onClick={() => handleExpand(prompt.id)}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`p-2.5 rounded-lg ${getTypeColor(prompt.type)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="calendly-h3">{prompt.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs border ${getTypeColor(prompt.type)}`}>
                            {getTypeLabel(prompt.type)}
                          </span>
                          {!prompt.enabled && (
                            <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200">
                              Disabled
                            </span>
                          )}
                          {hasChanges && (
                            <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">
                              Unsaved
                            </span>
                          )}
                        </div>
                        
                        <p className="calendly-body text-gray-600 mb-2">{prompt.description}</p>
                        
                        <div className="flex items-center space-x-4 text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span className="calendly-label-sm">
                              Updated {new Date(prompt.lastModified).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Tag className="w-4 h-4" />
                            <span className="calendly-label-sm">{prompt.category}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <span className="calendly-label-sm text-gray-500">Used in: </span>
                          <span className="calendly-label-sm text-gray-700">
                            {prompt.usedIn.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <span className="calendly-label-sm">Enabled</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const updatedPrompts = prompts.map(p =>
                              p.id === prompt.id ? { ...p, enabled: !p.enabled } : p
                            );
                            setPrompts(updatedPrompts);
                          }}
                          className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                          style={{ background: prompt.enabled ? '#10b981' : '#cbd5e0' }}
                          title={prompt.enabled ? 'Click to disable' : 'Click to enable'}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              prompt.enabled ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Editor */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 mt-6 pt-6">

                      {/* Configuration Section - Consistent height for all card types */}
                      <div className="mb-6">
                        <div className="min-h-[120px] flex flex-col">
                          {/* Channel Selection (for Slack templates) */}
                          {prompt.type === 'slack_template' && (
                            <>
                              <label className="calendly-label font-medium mb-2 block">Slack Channel</label>
                              <select
                                value={currentEditingData.channel || prompt.channel || ''}
                                onChange={(e) => updateEditingData(prompt.id, 'channel', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg calendly-body flex-1"
                              >
                                <option value="#int-product-updates">#int-product-updates</option>
                                <option value="#product-meeting-insights">#product-meeting-insights</option>
                                <option value="#product-changelog-approvals">#product-changelog-approvals</option>
                                <option value="#product-daily-content-updates">#product-daily-content-updates</option>
                              </select>
                              <p className="calendly-label-sm text-gray-500 mt-2">
                                The Slack channel where this template will be used for notifications.
                              </p>
                            </>
                          )}

                          {/* System Instructions (for AI prompts) */}
                          {prompt.type !== 'slack_template' && (
                            <>
                              <label className="calendly-label font-medium mb-2 block">System Instructions</label>
                              <textarea
                                value={currentEditingData.systemInstructions || prompt.systemInstructions || ''}
                                onChange={(e) => updateEditingData(prompt.id, 'systemInstructions', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg resize-none calendly-body flex-1"
                                style={{ minHeight: '80px' }}
                                placeholder="System instructions that define the AI's role and behavior..."
                              />
                            </>
                          )}
                        </div>
                      </div>

                      {/* Template Editor */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <label className="calendly-label font-medium">
                            {prompt.type === 'slack_template' ? 'Message Template' : 'Prompt Template'}
                          </label>
                          <div className="flex items-center space-x-2">
                            <span className="calendly-label-sm text-gray-500">
                              Variables: {prompt.variables.join(', ')}
                            </span>
                          </div>
                        </div>
                        <div className="min-h-[400px] flex flex-col">
                          <textarea
                            value={currentEditingData.template || prompt.template}
                            onChange={(e) => updateEditingData(prompt.id, 'template', e.target.value)}
                            className="w-full p-4 border border-gray-300 rounded-t-lg resize-none calendly-body font-mono text-sm flex-1"
                            style={{ minHeight: '300px' }}
                            placeholder={`Enter your ${prompt.type === 'slack_template' ? 'message template' : 'AI prompt'}...`}
                          />
                          
                          {/* Enhanced Action Buttons with button-like styling */}
                          <div className="border border-gray-300 border-t-0 rounded-b-lg bg-white">
                            <div className="border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 text-sm">
                                  {hasChanges && (
                                    <div className="flex items-center space-x-2 text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200 shadow-sm">
                                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                      <span className="font-medium">Unsaved changes</span>
                                    </div>
                                  )}
                                  {!hasChanges && (
                                    <div className="flex items-center space-x-2 text-green-700 bg-green-100 px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span className="font-medium">All changes saved</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                  {/* Real Data Toggle for Slack Templates */}
                                  {prompt.type === 'slack_template' && (
                                    <label className="flex items-center space-x-2 text-sm text-gray-600">
                                      <input
                                        type="checkbox"
                                        checked={useRealJiraData}
                                        onChange={(e) => setUseRealJiraData(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      />
                                      <span>Use real JIRA data</span>
                                    </label>
                                  )}
                                  
                                  <button
                                    onClick={() => handleReset(prompt.id)}
                                    disabled={!hasChanges}
                                    className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-200"
                                    title={hasChanges ? 'Reset to saved version' : 'No changes to reset'}
                                  >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    <span>Reset</span>
                                  </button>
                                  <button
                                    onClick={() => handleTest(prompt.id)}
                                    disabled={isTestingPrompt}
                                    className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm hover:bg-blue-100 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-50 disabled:hover:border-blue-300 transition-all duration-200"
                                    title="Test template with sample data"
                                  >
                                    {isTestingPrompt ? (
                                      <Settings className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <TestTube className="w-4 h-4 mr-2" />
                                    )}
                                    <span>Test</span>
                                  </button>
                                  <button
                                    onClick={() => handleSave(prompt.id)}
                                    disabled={!hasChanges || isSaving}
                                    className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border-2 border-blue-600 rounded-lg shadow-sm hover:bg-blue-700 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:hover:border-blue-600 transition-all duration-200"
                                    title={hasChanges ? 'Save changes to database' : 'No changes to save'}
                                  >
                                    {isSaving ? (
                                      <Settings className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <Save className="w-4 h-4 mr-2" />
                                    )}
                                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>


                      {/* Test Result */}
                      {testResult && expandedPrompt === prompt.id && (
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
                    </div>
                  )}
                </div>
              );
            })}

            {filteredPrompts.length === 0 && (
              <div className="text-center py-12 calendly-card">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="calendly-h3 text-gray-600 mb-2">No prompts found</h3>
                <p className="calendly-body text-gray-500">
                  Try adjusting your search terms or filters to find the prompts you're looking for.
                </p>
              </div>
            )}
            </div>
          )}

          {/* Create New Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="calendly-h2">Create New Prompt/Template</h2>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Create Form */}
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <label className="calendly-label font-medium mb-2 block">Name *</label>
                      <input
                        type="text"
                        value={createFormData.name}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                        placeholder="Enter prompt/template name..."
                        required
                      />
                    </div>

                    <div>
                      <label className="calendly-label font-medium mb-2 block">Description</label>
                      <textarea
                        value={createFormData.description}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg calendly-body resize-none"
                        rows={2}
                        placeholder="Describe what this prompt/template does..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="calendly-label font-medium mb-2 block">Type *</label>
                        <select
                          value={createFormData.type}
                          onChange={(e) => setCreateFormData(prev => ({ 
                            ...prev, 
                            type: e.target.value as 'ai_analysis' | 'slack_template' | 'content_generation'
                          }))}
                          className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                          required
                        >
                          <option value="ai_analysis">AI Analysis</option>
                          <option value="slack_template">Slack Template</option>
                          <option value="content_generation">Content Generation</option>
                        </select>
                      </div>

                      <div>
                        <label className="calendly-label font-medium mb-2 block">Category *</label>
                        <input
                          type="text"
                          value={createFormData.category}
                          onChange={(e) => setCreateFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                          placeholder="e.g., Meeting Analysis, Product Notifications..."
                          required
                        />
                      </div>
                    </div>

                    {/* Slack Channel (only for Slack templates) */}
                    {createFormData.type === 'slack_template' && (
                      <div>
                        <label className="calendly-label font-medium mb-2 block">Slack Channel</label>
                        <select
                          value={createFormData.channel}
                          onChange={(e) => setCreateFormData(prev => ({ ...prev, channel: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                        >
                          <option value="#int-product-updates">#int-product-updates</option>
                          <option value="#product-meeting-insights">#product-meeting-insights</option>
                          <option value="#product-changelog-approvals">#product-changelog-approvals</option>
                          <option value="#product-daily-content-updates">#product-daily-content-updates</option>
                        </select>
                      </div>
                    )}

                    {/* System Instructions (only for AI prompts) */}
                    {createFormData.type === 'ai_analysis' && (
                      <div>
                        <label className="calendly-label font-medium mb-2 block">System Instructions</label>
                        <textarea
                          value={createFormData.systemInstructions}
                          onChange={(e) => setCreateFormData(prev => ({ ...prev, systemInstructions: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg calendly-body resize-none font-mono text-sm"
                          rows={3}
                          placeholder="Define the AI's role and behavior..."
                        />
                      </div>
                    )}

                    {/* Template */}
                    <div>
                      <label className="calendly-label font-medium mb-2 block">
                        {createFormData.type === 'slack_template' ? 'Message Template' : 'Prompt Template'} *
                      </label>
                      <textarea
                        value={createFormData.template}
                        onChange={(e) => setCreateFormData(prev => ({ ...prev, template: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg calendly-body resize-none font-mono text-sm"
                        rows={createFormData.type === 'slack_template' ? 8 : 12}
                        placeholder={`Enter your ${createFormData.type === 'slack_template' ? 'Slack message template' : 'AI prompt template'}...`}
                        required
                      />
                      <p className="calendly-label-sm text-gray-500 mt-1">
                        Use {'{variable}'} syntax for template variables (e.g., {'{updateTitle}'}, {'{company}'})
                      </p>
                    </div>

                    {/* Variables */}
                    <div>
                      <label className="calendly-label font-medium mb-2 block">Variables</label>
                      <input
                        type="text"
                        placeholder="Enter variables separated by commas (e.g., updateTitle, description, date)"
                        onChange={(e) => {
                          const variables = e.target.value.split(',').map(v => v.trim()).filter(v => v.length > 0);
                          setCreateFormData(prev => ({ ...prev, variables }));
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg calendly-body"
                      />
                      <p className="calendly-label-sm text-gray-500 mt-1">
                        These variables can be used in your template with {'{variable}'} syntax
                      </p>
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="calendly-button calendly-button-secondary"
                      disabled={isCreating}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateNew}
                      disabled={!createFormData.name || !createFormData.template || !createFormData.category || isCreating}
                      className="calendly-button calendly-button-primary flex items-center space-x-2 disabled:opacity-50"
                    >
                      {isCreating ? (
                        <Settings className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      <span>{isCreating ? 'Creating...' : 'Create Prompt'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}