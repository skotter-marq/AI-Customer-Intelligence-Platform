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
  Minus,
  Search,
  X,
  Database,
  Bot,
  ChevronRight,
  Plus
} from 'lucide-react';

// Helper function to safely format meeting dates
const formatMeetingDate = (dateValue: string | null | undefined): string => {
  if (!dateValue) {
    return 'Date not available';
  }
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return format(date, 'PPP');
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Date not available';
  }
};

// Helper function to safely format due dates
const formatDueDate = (dateValue: string | null | undefined): string => {
  if (!dateValue) {
    return 'No due date';
  }
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.error('Due date formatting error:', error);
    return 'Invalid date';
  }
};

interface MeetingDetail {
  id: string;
  grain_id: string;
  customer_id: string;
  title: string;
  date: string;
  duration_minutes: number;
  participants: any[];
  raw_transcript: string;
  created_at: string;
  // Optional fields that may come from future enhancements
  sentiment_label?: string;
  sentiment_score?: number;
  confidence_score?: number;
  meeting_summary?: string;
  full_transcript?: string;
  status?: string;
  recording_url?: string;
  transcript_url?: string;
  grain_share_url?: string;
  customer_name?: string;
  // Add these fields for Zapier integration
  data_summary?: string;
  summary_points?: Array<{ text: string; timestamp: string }>;
  intelligence_notes?: string;
}

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState<'summary' | 'transcript' | 'insights' | 'actions'>('summary');
  
  // Sample data states (these would normally come from the API)
  const [insights, setInsights] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [featureRequests, setFeatureRequests] = useState([]);
  const [showCodaModal, setShowCodaModal] = useState(false);
  const [transcriptSearchTerm, setTranscriptSearchTerm] = useState('');
  const [codaFormData, setCodaFormData] = useState({
    name: '',
    email: '',
    account: '',
    interviewer: '',
    recording: '',
    status: 'Scheduled',
    role: 'End User',
    csat: '',
    initiative: '',
    jtbd1: '',
    jtbd2: '',
    jtbd3: '',
    jtbd4: '',
    keyTakeaways: ''
  });
  const [selectedAIPrompts, setSelectedAIPrompts] = useState([]);
  const [availablePrompts, setAvailablePrompts] = useState([]);

  useEffect(() => {
    async function fetchMeeting() {
      try {
        setLoading(true);
        const response = await fetch(`/api/meetings/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch meeting');
        }
        
        const data = await response.json();
        setMeeting(data.meeting);

        // Fetch related data
        const [insightsRes, actionsRes, topicsRes, featuresRes] = await Promise.all([
          fetch(`/api/meetings/${params.id}/insights`),
          fetch(`/api/meetings/${params.id}/actions`),
          fetch(`/api/meetings/${params.id}/topics`),
          fetch(`/api/meetings/${params.id}/features`)
        ]);

        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          setInsights(insightsData.insights || []);
        }

        if (actionsRes.ok) {
          const actionsData = await actionsRes.json();
          setActionItems(actionsData.actions || []);
        }

        if (topicsRes.ok) {
          const topicsData = await topicsRes.json();
          setTopics(topicsData.topics || []);
        }

        if (featuresRes.ok) {
          const featuresData = await featuresRes.json();
          setFeatureRequests(featuresData.features || []);
        }

      } catch (error) {
        console.error('Error fetching meeting:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchMeeting();
    }
  }, [params.id]);

  // Load available AI prompts for Coda integration
  useEffect(() => {
    async function loadAvailablePrompts() {
      try {
        const response = await fetch('/api/admin/prompts?type=ai_prompts');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.ai_prompts) {
            setAvailablePrompts(result.data.ai_prompts);
            // Pre-select useful prompts for Coda analysis
            setSelectedAIPrompts(['comprehensive-meeting-analysis', 'feature-request-prioritization']);
          }
        }
      } catch (error) {
        console.error('Failed to load AI prompts:', error);
      }
    }
    
    if (showCodaModal) {
      loadAvailablePrompts();
      // Pre-fill form with meeting data
      setCodaFormData(prev => ({
        ...prev,
        account: meeting?.customer_name || '',
        recording: meeting?.grain_share_url || meeting?.recording_url || meeting?.title || '',
        name: meeting?.participants?.[0]?.name || '',
        email: meeting?.participants?.[0]?.email || ''
      }));
    }
  }, [showCodaModal, meeting]);

  // Helper functions
  const getSentimentColor = (score: number | undefined): string => {
    if (!score) return '#f3f4f6';
    if (score > 0.5) return '#dcfce7';
    if (score > 0) return '#fef3c7';
    return '#fee2e2';
  };

  const getSentimentIcon = (sentiment: string | undefined) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="w-6 h-6 text-green-600" />;
      case 'negative': return <ThumbsDown className="w-6 h-6 text-red-600" />;
      default: return <Minus className="w-6 h-6 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'calendly-badge-error';
      case 'high': return 'calendly-badge-warning';
      case 'medium': return 'calendly-badge-info';
      case 'low': return 'calendly-badge-success';
      default: return 'calendly-badge-info';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'calendly-badge-success';
      case 'in_progress': return 'calendly-badge-warning';
      case 'open': return 'calendly-badge-info';
      default: return 'calendly-badge-info';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <h3 className="calendly-h3 mb-2">Loading meeting details...</h3>
            <p className="calendly-body">Please wait while we fetch the meeting information.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
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
    );
  }

  return (
    <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
      {/* Navigation */}
      <div className="calendly-card-static border-b" style={{ margin: '0 24px 24px 24px', padding: '16px 24px', borderRadius: '0' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/meetings')}
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
                onClick={() => router.push('/meetings')}
                className="calendly-body-sm"
                style={{ color: '#718096' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#4285f4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#718096';
                }}
              >
                Meetings
              </button>
              <span style={{ color: '#a0aec0' }}>›</span>
              <span className="calendly-body-sm" style={{ color: '#2d3748' }}>
                {meeting.title}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Meeting Title */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
          <p className="text-gray-600">
            {formatMeetingDate(meeting.date)} • {meeting.duration_minutes} minutes • {meeting.customer_name || 'Unknown Customer'}
          </p>
        </div>

        {/* Grain-Inspired Split Layout */}
        <div className="flex gap-6 h-[calc(100vh-160px)]">
          {/* Left Panel - Main Content with Tabs */}
          <div className="flex-1 space-y-4 flex flex-col">
            {/* Tabbed Content Area */}
            <div className="calendly-card p-0 flex flex-col flex-1">
              {/* Tab Headers */}
              <div className="flex border-b border-gray-200 px-6">
                {[
                  { id: 'summary', label: 'Summary', icon: FileText },
                  { id: 'transcript', label: 'Transcript', icon: MessageSquare },
                  { id: 'insights', label: 'Insights', icon: Lightbulb },
                  { id: 'actions', label: 'Actions', icon: CheckCircle }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveRightTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm transition-colors ${
                      activeRightTab === tab.id
                        ? 'border-b-2 text-blue-600 border-blue-600'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                
              {activeRightTab === 'transcript' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Meeting Transcript</h3>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Search Box */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search transcript..."
                      value={transcriptSearchTerm}
                      onChange={(e) => setTranscriptSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {transcriptSearchTerm && (
                      <button
                        onClick={() => setTranscriptSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg max-h-[600px] overflow-y-auto">
                    {meeting.raw_transcript ? (
                      <div className="p-6 space-y-4">
                        {meeting.raw_transcript.split('\n\n').map((paragraph, index) => {
                          const searchRegex = transcriptSearchTerm ? new RegExp(`(${transcriptSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi') : null;
                          const shouldShow = !transcriptSearchTerm || (searchRegex && searchRegex.test(paragraph));
                          
                          if (!shouldShow) return null;
                          
                          const highlightedText = searchRegex 
                            ? paragraph.replace(searchRegex, '<mark class="bg-yellow-200 px-1">$1</mark>')
                            : paragraph;
                          
                          return (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {Math.floor((index + 1) * 2)}:00
                                </span>
                              </div>
                              <div className="flex-1">
                                <p 
                                  className="text-gray-800 leading-relaxed"
                                  dangerouslySetInnerHTML={{ __html: highlightedText }}
                                />
                              </div>
                            </div>
                          );
                        }).filter(Boolean)}
                        {transcriptSearchTerm && meeting.raw_transcript.split('\n\n').every(paragraph => {
                          const searchRegex = new RegExp(`(${transcriptSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                          return !searchRegex.test(paragraph);
                        }) && (
                          <div className="p-12 text-center">
                            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
                            <p className="text-gray-600">No matches found for "{transcriptSearchTerm}". Try different keywords.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Transcript Available</h3>
                        <p className="text-gray-600">The transcript for this meeting is not yet available or still being processed.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeRightTab === 'insights' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
                  <div className="space-y-4">
                    {insights.map((insight: any) => (
                      <div key={insight.id} className="border-l-4 border-blue-400 bg-blue-50 p-4 rounded-r-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-blue-800">{insight.title}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(insight.priority)}`}>
                                {insight.priority}
                              </span>
                            </div>
                            <p className="text-blue-700 mb-2">{insight.description}</p>
                            {insight.quote && (
                              <blockquote className="text-blue-600 italic text-sm border-l-2 border-blue-300 pl-3 mt-2">
                                "{insight.quote}"
                              </blockquote>
                            )}
                            <div className="flex items-center space-x-4 mt-3 text-xs text-blue-600">
                              <span>Type: {insight.insight_type}</span>
                              <span>Confidence: {(insight.confidence_score * 100).toFixed(0)}%</span>
                              <span>Importance: {(insight.importance_score * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {insights.length === 0 && (
                      <div className="text-center py-12">
                        <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Available</h3>
                        <p className="text-gray-600">Insights are still being processed or none were detected in this meeting.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeRightTab === 'summary' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Meeting Summary</h3>
                  
                  {/* Meeting Overview */}
                  <div className="space-y-4">
                    {meeting.meeting_summary ? (
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 leading-relaxed">{meeting.meeting_summary}</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                        <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Summary Not Available</h3>
                        <p className="text-gray-600">The AI-generated summary for this meeting is still being processed or is not available.</p>
                      </div>
                    )}
                  </div>

                  {/* Key Statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Sentiment</p>
                          <div className="flex items-center space-x-2">
                            {getSentimentIcon(meeting.sentiment_label)}
                            <span className="text-lg font-semibold capitalize text-gray-900">
                              {meeting.sentiment_label || 'Neutral'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Target className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">AI Confidence</p>
                          <span className="text-lg font-semibold text-gray-900">
                            {meeting.confidence_score ? `${(meeting.confidence_score * 100).toFixed(0)}%` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeRightTab === 'actions' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Action Items</h3>
                  <div className="space-y-3">
                    {actionItems.map((item: any) => (
                      <div key={item.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              {item.assigned_to && (
                                <div className="flex items-center space-x-1">
                                  <User className="w-4 h-4" />
                                  <span>{item.assigned_to}</span>
                                </div>
                              )}
                              {item.due_date && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDueDate(item.due_date)}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <Tag className="w-4 h-4" />
                                <span className="capitalize">{item.category}</span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {actionItems.length === 0 && (
                      <div className="text-center py-12">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Action Items</h3>
                        <p className="text-gray-600">No action items have been identified in this meeting yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Right Panel - Context Cards */}
          <div className="w-80 space-y-4 flex-shrink-0">
            {/* Meeting Info Card */}
            <div className="calendly-card">
              <h3 className="font-semibold text-gray-900 mb-4">Meeting Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">{formatMeetingDate(meeting.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-gray-900">{meeting.duration_minutes} minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Building className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium text-gray-900">{meeting.customer_name || 'Unknown Customer'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Participants</p>
                    <p className="font-medium text-gray-900">{meeting.participants?.length || 0} attendees</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="calendly-card">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Insights</span>
                  <span className="font-medium text-gray-900">{insights.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Action Items</span>
                  <span className="font-medium text-gray-900">{actionItems.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Topics</span>
                  <span className="font-medium text-gray-900">{topics.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Feature Requests</span>
                  <span className="font-medium text-gray-900">{featureRequests.length}</span>
                </div>
              </div>
            </div>

            {/* Participant Details Card */}
            <div className="calendly-card">
              <h3 className="font-semibold text-gray-900 mb-4">Participants</h3>
              <div className="space-y-3">
                {meeting.participants?.slice(0, 5).map((participant: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {participant.name || participant.email || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {participant.company || participant.role || 'No details'}
                      </p>
                    </div>
                  </div>
                ))}
                {(meeting.participants?.length || 0) > 5 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{(meeting.participants?.length || 0) - 5} more participants
                  </p>
                )}
                {(!meeting.participants || meeting.participants.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No participant details available
                  </p>
                )}
              </div>
            </div>

            {/* Add to Coda Card */}
            <div className="calendly-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Research Export</h3>
                <Database className="w-4 h-4 text-gray-600" />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Export this meeting to Coda for research analysis and tracking.
              </p>
              <button
                onClick={() => setShowCodaModal(true)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Coda</span>
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Coda Export Modal */}
        {showCodaModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex">
              {/* Left Panel - Form Fields */}
              <div className="flex-1 overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Export to Coda Research</h2>
                    <button
                      onClick={() => setShowCodaModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Meeting Context */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Meeting Context</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Meeting:</span>
                        <span className="font-medium text-gray-900">{meeting.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium text-gray-900">{formatMeetingDate(meeting.date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium text-gray-900">{meeting.duration_minutes} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Research Details Form */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Research Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                        <input
                          type="text"
                          value={codaFormData.name}
                          onChange={(e) => setCodaFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Customer contact name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={codaFormData.email}
                          onChange={(e) => setCodaFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="customer@company.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account *</label>
                        <input
                          type="text"
                          value={codaFormData.account}
                          onChange={(e) => setCodaFormData(prev => ({ ...prev, account: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Company name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Interviewer</label>
                        <input
                          type="text"
                          value={codaFormData.interviewer}
                          onChange={(e) => setCodaFormData(prev => ({ ...prev, interviewer: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Internal team member"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={codaFormData.status}
                          onChange={(e) => setCodaFormData(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="No Show">No Show</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                          value={codaFormData.role}
                          onChange={(e) => setCodaFormData(prev => ({ ...prev, role: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="End User">End User</option>
                          <option value="Admin">Admin</option>
                          <option value="Decision Maker">Decision Maker</option>
                          <option value="Champion">Champion</option>
                          <option value="Influencer">Influencer</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* JTBD Fields */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Jobs to Be Done Analysis</h3>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map(num => (
                        <div key={num}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">JTBD {num}</label>
                          <input
                            type="text"
                            value={codaFormData[`jtbd${num}` as keyof typeof codaFormData]}
                            onChange={(e) => setCodaFormData(prev => ({ ...prev, [`jtbd${num}`]: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={`Job to be done ${num}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Takeaways */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Key Takeaways</label>
                    <textarea
                      value={codaFormData.keyTakeaways}
                      onChange={(e) => setCodaFormData(prev => ({ ...prev, keyTakeaways: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      placeholder="Main insights and takeaways from the meeting..."
                    />
                  </div>
                </div>
              </div>

              {/* Right Panel - AI Analysis Options */}
              <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">AI Analysis</h3>
                  <p className="text-sm text-gray-600 mt-1">Select AI prompts to run analysis and auto-populate fields</p>
                </div>
                
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Available Prompts</h4>
                    <div className="space-y-2">
                      {availablePrompts.map((prompt) => (
                        <label key={prompt.id} className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedAIPrompts.includes(prompt.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAIPrompts(prev => [...prev, prompt.id]);
                              } else {
                                setSelectedAIPrompts(prev => prev.filter(id => id !== prompt.id));
                              }
                            }}
                            className="mt-1 rounded border-gray-300"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-900">{prompt.name}</span>
                            <p className="text-xs text-gray-600">{prompt.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {selectedAIPrompts.length > 0 && (
                    <button
                      onClick={async () => {
                        try {
                          // Run AI analysis on selected prompts
                          const analysisPromises = selectedAIPrompts.map(promptId =>
                            fetch('/api/ai/analyze', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                promptId,
                                variables: {
                                  customer_name: meeting.customer_name,
                                  meeting_type: meeting.meeting_type || 'general',
                                  meeting_date: meeting.date,
                                  duration_minutes: meeting.duration_minutes,
                                  participants: JSON.stringify(meeting.participants || []),
                                  transcript: meeting.raw_transcript || ''
                                }
                              })
                            }).then(res => res.json())
                          );
                          
                          const results = await Promise.allSettled(analysisPromises);
                          
                          // Auto-populate form with AI results
                          results.forEach((result, index) => {
                            if (result.status === 'fulfilled' && result.value.success) {
                              const analysis = result.value.analysis;
                              const promptId = selectedAIPrompts[index];
                              
                              // Auto-populate based on prompt type
                              if (promptId === 'comprehensive-meeting-analysis' && analysis.overall_analysis) {
                                setCodaFormData(prev => ({
                                  ...prev,
                                  keyTakeaways: prev.keyTakeaways || analysis.overall_analysis.meeting_summary || ''
                                }));
                              }
                              
                              if (promptId === 'feature-request-prioritization' && analysis.feature_requests) {
                                const topFeatures = analysis.feature_requests
                                  .filter(f => f.customer_priority === 'must_have')
                                  .map(f => f.feature_title)
                                  .slice(0, 4);
                                
                                topFeatures.forEach((feature, idx) => {
                                  setCodaFormData(prev => ({
                                    ...prev,
                                    [`jtbd${idx + 1}`]: prev[`jtbd${idx + 1}` as keyof typeof prev] || feature
                                  }));
                                });
                              }
                            }
                          });
                          
                          alert('AI analysis complete! Form fields have been auto-populated.');
                        } catch (error) {
                          console.error('AI analysis failed:', error);
                          alert('AI analysis failed. Please try again.');
                        }
                      }}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Run AI Analysis ({selectedAIPrompts.length} prompts)
                    </button>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="p-4 border-t border-gray-200 space-y-3">
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/coda', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            action: 'create_research_initiative',
                            meetingId: meeting.id,
                            docId: process.env.NEXT_PUBLIC_CODA_DOC_ID || 'defaultDocId',
                            tableId: process.env.NEXT_PUBLIC_CODA_TABLE_ID || 'defaultTableId',
                            formData: codaFormData,
                            aiAnalysisConfig: {
                              selectedPrompts: selectedAIPrompts
                            }
                          })
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                          alert('Successfully exported to Coda with AI insights!');
                          setShowCodaModal(false);
                        } else {
                          throw new Error(result.error || 'Export failed');
                        }
                      } catch (error) {
                        console.error('Coda export error:', error);
                        alert('Failed to export to Coda. Please try again.');
                      }
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Export to Coda
                  </button>
                  
                  <button
                    onClick={() => setShowCodaModal(false)}
                    className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}