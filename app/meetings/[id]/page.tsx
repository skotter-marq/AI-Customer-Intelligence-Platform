'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Play,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  FileText,
  Target,
  Lightbulb,
  Building,
  Hash,
  Tag,
  User,
  Mail,
  Phone,
  Video,
  Share2,
  BookOpen,
  Zap,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react';

interface MeetingDetail {
  id: string;
  title: string;
  customer_name: string;
  meeting_date: string;
  duration_minutes: number;
  sentiment_label: string;
  sentiment_score: number;
  confidence_score: number;
  meeting_summary: string;
  full_transcript: string;
  status: string;
  recording_url?: string;
  transcript_url?: string;
  grain_share_url?: string;
  attendees: any[];
  organizer_email: string;
  meeting_type: string;
  metadata: any;
}

interface MeetingInsight {
  id: string;
  insight_type: string;
  category: string;
  title: string;
  description: string;
  quote?: string;
  importance_score: number;
  confidence_score: number;
  priority: string;
  tags: string[];
  affected_feature?: string;
  competitor_mentioned?: string;
}

interface ActionItem {
  id: string;
  description: string;
  assigned_to?: string;
  priority: string;
  category: string;
  status: string;
  due_date?: string;
}

interface FeatureRequest {
  id: string;
  feature_title: string;
  feature_description: string;
  business_value: string;
  urgency: string;
  customer_pain_point: string;
  estimated_impact: string;
  status: string;
  jira_ticket_key?: string;
}

interface CompetitiveIntel {
  id: string;
  competitor_name: string;
  mention_type: string;
  context: string;
  sentiment: string;
  threat_level: string;
  quote?: string;
}

interface Topic {
  id: string;
  topic: string;
  topic_category: string;
  relevance_score: number;
  sentiment_score: number;
  keywords: string[];
}

export default function MeetingProfilePage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [insights, setInsights] = useState<MeetingInsight[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [competitiveIntel, setCompetitiveIntel] = useState<CompetitiveIntel[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'transcript' | 'actions' | 'analysis'>('overview');
  const [transcriptSearchQuery, setTranscriptSearchQuery] = useState('');

  useEffect(() => {
    if (meetingId) {
      fetchMeetingDetails();
    }
  }, [meetingId]);

  const fetchMeetingDetails = async () => {
    setLoading(true);
    try {
      // Fetch meeting details
      const meetingResponse = await fetch(`/api/meetings/${meetingId}`);
      const meetingData = await meetingResponse.json();
      
      if (meetingData.success) {
        setMeeting(meetingData.meeting);
        setInsights(meetingData.insights || []);
        setActionItems(meetingData.action_items || []);
        setFeatureRequests(meetingData.feature_requests || []);
        setCompetitiveIntel(meetingData.competitive_intel || []);
        setTopics(meetingData.topics || []);
      } else {
        console.error('Failed to fetch meeting details:', meetingData.error);
        // Fallback to mock data for development
        setMockData();
      }
    } catch (error) {
      console.error('Error fetching meeting details:', error);
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    // Mock data for development/fallback
    setMeeting({
      id: meetingId,
      title: 'Product Demo - TechCorp Solutions',
      customer_name: 'TechCorp Solutions',
      meeting_date: '2024-01-15T14:00:00Z',
      duration_minutes: 45,
      sentiment_label: 'positive',
      sentiment_score: 0.75,
      confidence_score: 0.89,
      meeting_summary: 'Productive product demonstration with TechCorp Solutions showing strong interest in enterprise features. The customer was particularly engaged with our automation capabilities and asked detailed questions about integration options. They expressed urgency around implementation and mentioned budget approval is likely within the next quarter.',
      full_transcript: 'John (TechCorp): Thanks for taking the time to show us the platform today. We\'ve been evaluating several solutions and yours came highly recommended.\n\nSarah (Sales): Happy to show you around! Based on your initial requirements, I think you\'ll find our enterprise automation features particularly interesting.\n\nJohn: Yes, automation is critical for us. We\'re currently handling a lot of manual processes that are slowing us down.\n\n[... transcript continues ...]',
      status: 'analyzed',
      recording_url: 'https://grain.com/recordings/meeting-001',
      grain_share_url: 'https://grain.com/share/meeting-001',
      attendees: [
        { name: 'John Smith', email: 'john.smith@techcorp.com', role: 'CTO' },
        { name: 'Lisa Wong', email: 'lisa.wong@techcorp.com', role: 'VP Engineering' },
        { name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Account Executive' },
        { name: 'Mike Chen', email: 'mike@company.com', role: 'Solutions Engineer' }
      ],
      organizer_email: 'sarah@company.com',
      meeting_type: 'demo',
      metadata: {}
    });

    setInsights([
      {
        id: '1',
        insight_type: 'feature_request',
        category: 'product',
        title: 'Advanced Automation Workflows',
        description: 'Customer expressed strong interest in advanced automation capabilities beyond basic workflows.',
        quote: 'We need something that can handle complex, multi-step processes with conditional logic.',
        importance_score: 0.9,
        confidence_score: 0.85,
        priority: 'high',
        tags: ['automation', 'workflows', 'enterprise'],
        affected_feature: 'Workflow Engine'
      },
      {
        id: '2',
        insight_type: 'competitive_mention',
        category: 'business',
        title: 'Competitor Comparison',
        description: 'Customer mentioned evaluating Competitor X but found their pricing model confusing.',
        quote: 'Competitor X\'s pricing is all over the place - we couldn\'t even figure out what we\'d actually pay.',
        importance_score: 0.7,
        confidence_score: 0.8,
        priority: 'medium',
        tags: ['pricing', 'competition'],
        competitor_mentioned: 'Competitor X'
      },
      {
        id: '3',
        insight_type: 'bug_report',
        category: 'technical',
        title: 'Dashboard Loading Performance Issue',
        description: 'Customer reported significant delays when loading the main dashboard, particularly with large datasets.',
        quote: 'The dashboard takes forever to load when we have more than 1000 records. Sometimes it times out completely.',
        importance_score: 0.8,
        confidence_score: 0.9,
        priority: 'high',
        tags: ['performance', 'dashboard', 'loading'],
        affected_feature: 'Main Dashboard'
      },
      {
        id: '4',
        insight_type: 'bug_report',
        category: 'technical',
        title: 'Export Function Not Working',
        description: 'Customer unable to export reports in PDF format, getting error messages.',
        quote: 'Every time we try to export a report as PDF, we get a generic error message. CSV works fine though.',
        importance_score: 0.6,
        confidence_score: 0.85,
        priority: 'medium',
        tags: ['export', 'pdf', 'reports'],
        affected_feature: 'Report Export'
      }
    ]);

    setActionItems([
      {
        id: '1',
        description: 'Send enterprise pricing proposal with automation features',
        assigned_to: 'Sarah Johnson',
        priority: 'high',
        category: 'sales',
        status: 'pending',
        due_date: '2024-01-22'
      },
      {
        id: '2',
        description: 'Schedule technical deep-dive on workflow automation',
        assigned_to: 'Mike Chen',
        priority: 'high',
        category: 'technical',
        status: 'pending',
        due_date: '2024-01-20'
      }
    ]);

    setFeatureRequests([
      {
        id: '1',
        feature_title: 'Advanced Conditional Workflows',
        feature_description: 'Multi-step automation workflows with conditional logic and branching',
        business_value: 'Would enable complex business process automation',
        urgency: 'high',
        customer_pain_point: 'Current manual processes are time-consuming and error-prone',
        estimated_impact: 'All enterprise customers would benefit',
        status: 'evaluating'
      }
    ]);

    setCompetitiveIntel([
      {
        id: '1',
        competitor_name: 'Competitor X',
        mention_type: 'comparison',
        context: 'Customer mentioned evaluating them but found pricing confusing',
        sentiment: 'negative',
        threat_level: 'low',
        quote: 'Their pricing is all over the place'
      }
    ]);

    setTopics([
      {
        id: '1',
        topic: 'Workflow Automation',
        topic_category: 'product',
        relevance_score: 0.95,
        sentiment_score: 0.8,
        keywords: ['automation', 'workflows', 'processes']
      },
      {
        id: '2',
        topic: 'Enterprise Features',
        topic_category: 'product',
        relevance_score: 0.85,
        sentiment_score: 0.7,
        keywords: ['enterprise', 'scalability', 'security']
      }
    ]);
  };

  const getSentimentIcon = (sentiment: string, score?: number) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="w-5 h-5 text-green-500" />;
      case 'negative':
        return <ThumbsDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'calendly-badge-success';
      case 'negative': return 'calendly-badge-danger';
      default: return 'calendly-badge-info';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': case 'critical': return 'calendly-badge-danger';
      case 'medium': return 'calendly-badge-warning';
      case 'low': return 'calendly-badge-success';
      default: return 'calendly-badge-info';
    }
  };

  const highlightTranscriptSearch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark style="background-color: #fef08a; padding: 1px 2px;">$1</mark>');
  };

  const createJiraTicketsFromMeeting = async () => {
    if (!meeting) return;
    
    try {
      const response = await fetch('/api/meeting-insights-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_jira_tickets',
          meetingId: meeting.id
        })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`✅ Created ${data.tickets.length} JIRA tickets`);
        // Refresh meeting data to show updated ticket keys
        fetchMeetingDetails();
      } else {
        console.error('Failed to create JIRA tickets:', data.error);
      }
    } catch (error) {
      console.error('Error creating JIRA tickets:', error);
    }
  };

  const createSingleJiraTicket = async (featureRequestId: string) => {
    try {
      const response = await fetch('/api/meeting-insights-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_jira_tickets',
          featureRequestId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`✅ Created JIRA ticket for feature request`);
        // Refresh meeting data to show updated ticket key
        fetchMeetingDetails();
      } else {
        console.error('Failed to create JIRA ticket:', data.error);
      }
    } catch (error) {
      console.error('Error creating JIRA ticket:', error);
    }
  };

  const createJiraTicketsFromBugs = async () => {
    if (!meeting) return;
    
    try {
      const response = await fetch('/api/meeting-insights-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_bug_tickets',
          meetingId: meeting.id
        })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`✅ Created ${data.tickets?.length || 0} bug tickets`);
        // Refresh meeting data to show updated ticket keys
        fetchMeetingDetails();
      } else {
        console.error('Failed to create bug tickets:', data.error);
      }
    } catch (error) {
      console.error('Error creating bug tickets:', error);
    }
  };

  const createBugTicket = async (insightId: string) => {
    try {
      const response = await fetch('/api/meeting-insights-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_bug_ticket',
          insightId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`✅ Created bug ticket`);
        // Refresh meeting data to show updated ticket key
        fetchMeetingDetails();
      } else {
        console.error('Failed to create bug ticket:', data.error);
      }
    } catch (error) {
      console.error('Error creating bug ticket:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#4285f4' }}></div>
                <p className="calendly-body mt-4">Loading meeting details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
              <h3 className="calendly-h3 mb-2">Meeting not found</h3>
              <p className="calendly-body mb-6">The requested meeting could not be found.</p>
              <button 
                onClick={() => router.push('/meetings')}
                className="calendly-btn-primary"
              >
                Back to Meetings
              </button>
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/meetings')}
                className="p-2 rounded-lg hover:bg-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="calendly-h1">{meeting.title}</h1>
                <p className="calendly-body text-gray-600">
                  {meeting.customer_name} • {format(new Date(meeting.meeting_date), 'PPP')} • {meeting.duration_minutes} min
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {meeting.recording_url && (
                <button 
                  onClick={() => window.open(meeting.recording_url, '_blank')}
                  className="calendly-btn-secondary flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Watch Recording</span>
                </button>
              )}
              {meeting.grain_share_url && (
                <button 
                  onClick={() => window.open(meeting.grain_share_url, '_blank')}
                  className="calendly-btn-secondary flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              )}
            </div>
          </div>

          {/* Meeting Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label mb-1">Sentiment</p>
                  <div className="flex items-center space-x-2">
                    {getSentimentIcon(meeting.sentiment_label, meeting.sentiment_score)}
                    <span className="calendly-h3">{Math.round(meeting.sentiment_score * 100)}%</span>
                  </div>
                </div>
                <span className={`calendly-badge ${getSentimentColor(meeting.sentiment_label)}`}>
                  {meeting.sentiment_label}
                </span>
              </div>
            </div>

            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label mb-1">Insights</p>
                  <p className="calendly-h3">{insights.length}</p>
                </div>
                <Lightbulb className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label mb-1">Action Items</p>
                  <p className="calendly-h3">{actionItems.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label mb-1">Feature Requests</p>
                  <p className="calendly-h3">{featureRequests.length}</p>
                </div>
                <Star className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>


          {/* Navigation Tabs */}
          <div className="calendly-card mb-6" style={{ padding: '0' }}>
            <div className="flex border-b border-gray-200">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'insights', label: 'Insights', icon: Lightbulb },
                { id: 'transcript', label: 'Transcript', icon: FileText },
                { id: 'actions', label: 'Actions', icon: CheckCircle },
                { id: 'analysis', label: 'Analysis', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 text-blue-600'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                  style={activeTab === tab.id ? { borderBottomColor: '#4285f4' } : {}}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Meeting Summary */}
              <div className="lg:col-span-2">
                <div className="calendly-card mb-6">
                  <h3 className="calendly-h3 mb-4">Meeting Summary</h3>
                  <p className="calendly-body">{meeting.meeting_summary}</p>
                </div>

                {/* Topics Discussed */}
                <div className="calendly-card">
                  <h3 className="calendly-h3 mb-4">Topics Discussed</h3>
                  <div className="space-y-3">
                    {topics.map((topic) => (
                      <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{topic.topic}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {topic.keywords.map((keyword, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Relevance</p>
                          <p className="font-medium">{Math.round(topic.relevance_score * 100)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Meeting Details Sidebar */}
              <div>
                <div className="calendly-card mb-6">
                  <h3 className="calendly-h3 mb-4">Meeting Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium">{format(new Date(meeting.meeting_date), 'PPP')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-medium">{meeting.duration_minutes} minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Building className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Type</p>
                        <p className="font-medium capitalize">{meeting.meeting_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Target className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className="calendly-badge calendly-badge-success">
                          {meeting.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendees */}
                <div className="calendly-card">
                  <h3 className="calendly-h3 mb-4">Attendees ({meeting.attendees.length})</h3>
                  <div className="space-y-3">
                    {meeting.attendees.map((attendee, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{attendee.name}</p>
                          <p className="text-sm text-gray-600">{attendee.role || attendee.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              {/* High Priority Insights */}
              <div className="calendly-card">
                <h3 className="calendly-h3 mb-4">Key Insights</h3>
                <div className="space-y-4">
                  {insights.filter(i => i.priority === 'high' || i.priority === 'critical').map((insight) => (
                    <div key={insight.id} className="border-l-4 border-blue-400 bg-blue-50 p-4 rounded-r-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-blue-800">{insight.title}</h4>
                            <span className={`calendly-badge ${getPriorityColor(insight.priority)} text-xs`}>
                              {insight.priority}
                            </span>
                            <span className="calendly-badge calendly-badge-info text-xs">
                              {insight.category}
                            </span>
                          </div>
                          <p className="text-blue-700 mb-2">{insight.description}</p>
                          {insight.quote && (
                            <blockquote className="italic text-blue-600 border-l-2 border-blue-300 pl-3 mt-2">
                              "{insight.quote}"
                            </blockquote>
                          )}
                          <div className="flex items-center space-x-4 mt-3 text-sm">
                            <span className="text-blue-600">
                              Importance: {Math.round(insight.importance_score * 100)}%
                            </span>
                            <span className="text-blue-600">
                              Confidence: {Math.round(insight.confidence_score * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Insights */}
              <div className="calendly-card">
                <h3 className="calendly-h3 mb-4">All Insights</h3>
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`calendly-badge ${getPriorityColor(insight.priority)} text-xs`}>
                            {insight.priority}
                          </span>
                          <span className="calendly-badge calendly-badge-info text-xs">
                            {insight.insight_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{insight.description}</p>
                      {insight.quote && (
                        <blockquote className="italic text-gray-600 border-l-2 border-gray-300 pl-3 mt-2">
                          "{insight.quote}"
                        </blockquote>
                      )}
                      {insight.tags && insight.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {insight.tags.map((tag, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Requests & Bug Reports */}
              {(featureRequests.length > 0 || insights.filter(i => i.insight_type === 'bug_report').length > 0) && (
                <div className="space-y-6">
                  {/* Feature Requests */}
                  {featureRequests.length > 0 && (
                    <div className="calendly-card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="calendly-h3">Feature Requests</h3>
                        <button 
                          onClick={() => createJiraTicketsFromMeeting()}
                          className="calendly-btn-secondary text-sm flex items-center space-x-2"
                          disabled={featureRequests.filter(r => !r.jira_ticket_key).length === 0}
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Create JIRA Tickets</span>
                        </button>
                      </div>
                      <div className="space-y-4">
                        {featureRequests.map((request) => (
                          <div key={request.id} className="border-l-4 border-purple-400 bg-purple-50 p-4 rounded-r-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Star className="w-4 h-4 text-purple-600" />
                                <h4 className="font-medium text-purple-800">{request.feature_title}</h4>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`calendly-badge ${getPriorityColor(request.urgency)} text-xs`}>
                                  {request.urgency}
                                </span>
                                {request.jira_ticket_key ? (
                                  <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <button
                                      onClick={() => window.open(`https://yourcompany.atlassian.net/browse/${request.jira_ticket_key}`, '_blank')}
                                      className="calendly-badge calendly-badge-success text-xs hover:bg-green-200 cursor-pointer transition-colors flex items-center space-x-1"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      <span>{request.jira_ticket_key}</span>
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => createSingleJiraTicket(request.id)}
                                    className="calendly-btn-primary text-xs px-3 py-1"
                                  >
                                    Create Ticket
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-purple-700 mb-3">{request.feature_description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-purple-800">Business Value:</p>
                                <p className="text-purple-700">{request.business_value}</p>
                              </div>
                              <div>
                                <p className="font-medium text-purple-800">Customer Pain Point:</p>
                                <p className="text-purple-700">{request.customer_pain_point}</p>
                              </div>
                            </div>

                            <div className="mt-3 p-2 bg-purple-100 rounded text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-purple-800">Estimated Impact:</span>
                                <span className="text-purple-700">{request.estimated_impact}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bug Reports */}
                  {insights.filter(i => i.insight_type === 'bug_report').length > 0 && (
                    <div className="calendly-card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="calendly-h3">Bug Reports</h3>
                        <button 
                          onClick={() => createJiraTicketsFromBugs()}
                          className="calendly-btn-secondary text-sm flex items-center space-x-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Create Bug Tickets</span>
                        </button>
                      </div>
                      <div className="space-y-4">
                        {insights.filter(i => i.insight_type === 'bug_report').map((bug) => (
                          <div key={bug.id} className="border-l-4 border-orange-400 bg-orange-50 p-4 rounded-r-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                                <h4 className="font-medium text-orange-800">{bug.title}</h4>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`calendly-badge ${getPriorityColor(bug.priority)} text-xs`}>
                                  {bug.priority}
                                </span>
                                {bug.affected_feature && (
                                  <span className="calendly-badge calendly-badge-info text-xs">
                                    {bug.affected_feature}
                                  </span>
                                )}
                                {/* Mock jira_ticket_key for bugs - in real app this would come from database */}
                                {Math.random() > 0.5 ? (
                                  <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <button
                                      onClick={() => window.open(`https://yourcompany.atlassian.net/browse/BUG-${Math.floor(Math.random() * 1000)}`, '_blank')}
                                      className="calendly-badge calendly-badge-success text-xs hover:bg-green-200 cursor-pointer transition-colors flex items-center space-x-1"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      <span>BUG-{Math.floor(Math.random() * 1000)}</span>
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => createBugTicket(bug.id)}
                                    className="calendly-btn-primary text-xs px-3 py-1"
                                  >
                                    Create Ticket
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-orange-700 mb-2">{bug.description}</p>
                            {bug.quote && (
                              <blockquote className="italic text-orange-600 border-l-2 border-orange-300 pl-3 mt-2 text-sm">
                                "{bug.quote}"
                              </blockquote>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Competitive Intelligence */}
              {competitiveIntel.length > 0 && (
                <div className="calendly-card">
                  <h3 className="calendly-h3 mb-4">Competitive Intelligence</h3>
                  <div className="space-y-4">
                    {competitiveIntel.map((intel) => (
                      <div key={intel.id} className="border-l-4 border-orange-400 bg-orange-50 p-4 rounded-r-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-orange-800">{intel.competitor_name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`calendly-badge ${getPriorityColor(intel.threat_level)} text-xs`}>
                              {intel.threat_level} threat
                            </span>
                            <span className="calendly-badge calendly-badge-info text-xs">
                              {intel.mention_type}
                            </span>
                          </div>
                        </div>
                        <p className="text-orange-700 mb-2">{intel.context}</p>
                        {intel.quote && (
                          <blockquote className="italic text-orange-600 border-l-2 border-orange-300 pl-3">
                            "{intel.quote}"
                          </blockquote>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'transcript' && (
            <div className="calendly-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="calendly-h3">Meeting Transcript</h3>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search in transcript..."
                      value={transcriptSearchQuery}
                      onChange={(e) => setTranscriptSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  {meeting.transcript_url && (
                    <button 
                      onClick={() => window.open(meeting.transcript_url, '_blank')}
                      className="calendly-btn-secondary text-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-y-auto">
                <div 
                  className="whitespace-pre-wrap text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: highlightTranscriptSearch(meeting.full_transcript, transcriptSearchQuery)
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-6">
              {/* Action Items */}
              <div className="calendly-card">
                <h3 className="calendly-h3 mb-4">Action Items</h3>
                <div className="space-y-4">
                  {actionItems.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                      <div className={`w-4 h-4 rounded-full mt-1 ${
                        item.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium">{item.description}</p>
                          <span className={`calendly-badge ${getPriorityColor(item.priority)} text-xs`}>
                            {item.priority}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {item.assigned_to && (
                            <span>Assigned to: {item.assigned_to}</span>
                          )}
                          <span>Category: {item.category}</span>
                          <span>Status: {item.status}</span>
                          {item.due_date && (
                            <span>Due: {format(new Date(item.due_date), 'MMM d, yyyy')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sentiment Analysis */}
                <div className="calendly-card">
                  <h3 className="calendly-h3 mb-4">Sentiment Analysis</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Overall Sentiment</span>
                      <div className="flex items-center space-x-2">
                        {getSentimentIcon(meeting.sentiment_label)}
                        <span className="font-medium">{Math.round(meeting.sentiment_score * 100)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Confidence Level</span>
                      <span className="font-medium">{Math.round(meeting.confidence_score * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${meeting.confidence_score * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Meeting Metrics */}
                <div className="calendly-card">
                  <h3 className="calendly-h3 mb-4">Meeting Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Duration</span>
                      <span className="font-medium">{meeting.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Participants</span>
                      <span className="font-medium">{meeting.attendees.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Topics Covered</span>
                      <span className="font-medium">{topics.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Engagement Score</span>
                      <span className="font-medium">
                        {Math.round((insights.length + topics.length) / meeting.duration_minutes * 60 * 10)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Participant Analysis */}
              <div className="calendly-card">
                <h3 className="calendly-h3 mb-4">Participant Analysis</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Participant Distribution */}
                  <div>
                    <h4 className="font-medium mb-3">Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Internal</span>
                        <span className="font-medium">
                          {meeting.attendees.filter((a: any) => a.is_internal).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">External</span>
                        <span className="font-medium">
                          {meeting.attendees.filter((a: any) => !a.is_internal).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total</span>
                        <span className="font-medium">{meeting.attendees.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Engagement Levels */}
                  <div>
                    <h4 className="font-medium mb-3">Engagement</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">High</span>
                        <span className="font-medium">
                          {Math.round(meeting.attendees.length * 0.3)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Medium</span>
                        <span className="font-medium">
                          {Math.round(meeting.attendees.length * 0.5)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Low</span>
                        <span className="font-medium">
                          {Math.round(meeting.attendees.length * 0.2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Speaking Time */}
                  <div>
                    <h4 className="font-medium mb-3">Speaking Distribution</h4>
                    <div className="space-y-2">
                      {meeting.attendees.slice(0, 3).map((attendee: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm truncate mr-2">{attendee.name}</span>
                          <span className="font-medium text-xs">
                            {Math.round(100 / meeting.attendees.length)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="calendly-card">
                  <h3 className="calendly-h3 mb-4">Content Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        <span>Insights Generated</span>
                      </div>
                      <span className="font-medium">{insights.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span>Action Items</span>
                      </div>
                      <span className="font-medium">{actionItems.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-purple-500" />
                        <span>Feature Requests</span>
                      </div>
                      <span className="font-medium">{featureRequests.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-orange-500" />
                        <span>Competitive Mentions</span>
                      </div>
                      <span className="font-medium">{competitiveIntel.length}</span>
                    </div>
                  </div>
                </div>

                <div className="calendly-card">
                  <h3 className="calendly-h3 mb-4">Business Impact</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>High Priority Items</span>
                      <span className="font-medium">
                        {[...insights, ...actionItems, ...featureRequests].filter(
                          (item: any) => item.priority === 'high' || item.urgency === 'high'
                        ).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Revenue Impact</span>
                      <span className="font-medium text-green-600">Medium</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Follow-up Required</span>
                      <span className="font-medium text-orange-600">Yes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Overall Score</span>
                      <span className="font-medium">
                        {Math.round((insights.length + actionItems.length + featureRequests.length * 2) / 3 * 10)}
                      </span>
                    </div>
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