'use client';

import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Search,
  Filter,
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
  Tag,
  ExternalLink,
  ArrowUpDown,
  Grid3X3,
  List,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

interface GrainMeeting {
  id: string;
  title: string;
  customer: string;
  date: string;
  duration: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  keyTopics: string[];
  actionItems: string[];
  attendees: string[];
  recording_url?: string;
  transcript_url?: string;
  status: 'recorded' | 'processing' | 'transcribed' | 'analyzed';
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<GrainMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'recorded' | 'processing' | 'transcribed' | 'analyzed'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'date' | 'customer' | 'duration' | 'sentiment'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock meetings data from Grain
  const mockMeetings: GrainMeeting[] = [
    {
      id: 'meeting-001',
      title: 'Product Demo - MarketingCorp',
      customer: 'MarketingCorp',
      date: '2024-01-15T14:00:00Z',
      duration: '45 min',
      sentiment: 'positive',
      summary: 'Successful product demonstration with strong interest in enterprise features. Customer showed particular interest in automation capabilities and integration options.',
      keyTopics: ['Product Demo', 'Enterprise Features', 'Automation', 'Integrations', 'Pricing'],
      actionItems: [
        'Send enterprise pricing proposal',
        'Schedule technical integration call',
        'Provide case study examples'
      ],
      attendees: ['John Smith (MarketingCorp)', 'Sarah Johnson (Sales)', 'Mike Chen (Product)'],
      recording_url: 'https://grain.com/recordings/meeting-001',
      transcript_url: 'https://grain.com/transcripts/meeting-001',
      status: 'analyzed',
      priority: 'high',
      tags: ['Demo', 'Enterprise', 'Hot Lead']
    },
    {
      id: 'meeting-002',
      title: 'Quarterly Business Review - TechStart Inc',
      customer: 'TechStart Inc',
      date: '2024-01-14T10:30:00Z',
      duration: '60 min',
      sentiment: 'neutral',
      summary: 'Regular quarterly review discussing usage metrics and upcoming needs. Customer expressed some concerns about recent feature changes but overall satisfied.',
      keyTopics: ['QBR', 'Usage Metrics', 'Feature Feedback', 'Renewal Discussion', 'Support Issues'],
      actionItems: [
        'Address feature rollback concerns',
        'Provide updated usage analytics',
        'Schedule renewal discussion'
      ],
      attendees: ['Lisa Wong (TechStart)', 'David Miller (CSM)', 'Jennifer Park (Support)'],
      recording_url: 'https://grain.com/recordings/meeting-002',
      transcript_url: 'https://grain.com/transcripts/meeting-002',
      status: 'analyzed',
      priority: 'medium',
      tags: ['QBR', 'Customer Success', 'Renewal']
    },
    {
      id: 'meeting-003',
      title: 'Support Escalation - GlobalCorp',
      customer: 'GlobalCorp',
      date: '2024-01-13T16:00:00Z',
      duration: '30 min',
      sentiment: 'negative',
      summary: 'Customer escalation regarding API integration issues causing production downtime. Urgent resolution required to prevent churn risk.',
      keyTopics: ['API Issues', 'Production Downtime', 'Integration Problems', 'Churn Risk', 'Technical Support'],
      actionItems: [
        'Immediate engineering review of API logs',
        'Provide temporary workaround solution',
        'Schedule follow-up in 24 hours'
      ],
      attendees: ['Robert Kim (GlobalCorp)', 'Alex Thompson (Engineering)', 'Maria Garcia (Support Lead)'],
      recording_url: 'https://grain.com/recordings/meeting-003',
      transcript_url: 'https://grain.com/transcripts/meeting-003',
      status: 'analyzed',
      priority: 'high',
      tags: ['Escalation', 'API', 'Churn Risk']
    },
    {
      id: 'meeting-004',
      title: 'Discovery Call - StartupXYZ',
      customer: 'StartupXYZ',
      date: '2024-01-12T11:00:00Z',
      duration: '25 min',
      sentiment: 'positive',
      summary: 'Initial discovery call with promising startup. Good fit for our SMB offering with potential for growth.',
      keyTopics: ['Discovery', 'SMB Needs', 'Growth Potential', 'Use Cases', 'Timeline'],
      actionItems: [
        'Send SMB pricing information',
        'Provide product trial access',
        'Schedule technical demo'
      ],
      attendees: ['Emma Davis (StartupXYZ)', 'Tom Wilson (BDR)', 'Rachel Green (Sales)'],
      recording_url: 'https://grain.com/recordings/meeting-004',
      status: 'transcribed',
      priority: 'medium',
      tags: ['Discovery', 'SMB', 'New Lead']
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch meetings
    setLoading(true);
    setTimeout(() => {
      setMeetings(mockMeetings);
      setLoading(false);
    }, 1000);
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'calendly-badge-success';
      case 'neutral': return 'calendly-badge-info';
      case 'negative': return 'calendly-badge-danger';
      default: return 'calendly-badge-info';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'analyzed': return 'calendly-badge-success';
      case 'transcribed': return 'calendly-badge-info';
      case 'processing': return 'calendly-badge-warning';
      case 'recorded': return 'calendly-badge-info';
      default: return 'calendly-badge-info';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'calendly-badge-danger';
      case 'medium': return 'calendly-badge-warning';
      case 'low': return 'calendly-badge-success';
      default: return 'calendly-badge-info';
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = !searchQuery || 
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.keyTopics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSentiment = sentimentFilter === 'all' || meeting.sentiment === sentimentFilter;
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
    
    // Date filter logic
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const meetingDate = new Date(meeting.date);
      const now = new Date();
      const diffTime = now.getTime() - meetingDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      switch (dateFilter) {
        case 'today':
          matchesDate = diffDays < 1;
          break;
        case 'week':
          matchesDate = diffDays < 7;
          break;
        case 'month':
          matchesDate = diffDays < 30;
          break;
      }
    }
    
    return matchesSearch && matchesSentiment && matchesStatus && matchesDate;
  });

  const handleMeetingClick = (meetingId: string) => {
    // Navigate to meeting detail page or open recording
    console.log('View meeting:', meetingId);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#4285f4' }}></div>
                <p className="calendly-body mt-4">Loading meetings...</p>
              </div>
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
          <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
            <div>
              <h1 className="calendly-h1">Meetings</h1>
              <p className="calendly-body">Customer meetings and call insights from Grain recordings</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="calendly-btn-secondary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Total Meetings</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{meetings.length}</p>
                </div>
                <MessageSquare className="w-8 h-8" style={{ color: '#4285f4' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>This Week</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>
                    {meetings.filter(m => {
                      const diffDays = (new Date().getTime() - new Date(m.date).getTime()) / (1000 * 60 * 60 * 24);
                      return diffDays < 7;
                    }).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8" style={{ color: '#10b981' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Positive Sentiment</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>
                    {Math.round((meetings.filter(m => m.sentiment === 'positive').length / meetings.length) * 100)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8" style={{ color: '#10b981' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>High Priority</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{meetings.filter(m => m.priority === 'high').length}</p>
                </div>
                <AlertCircle className="w-8 h-8" style={{ color: '#ef4444' }} />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="calendly-card" style={{ marginBottom: '24px' }}>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#718096' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search meetings, customers, or topics..."
                    className="w-full pl-12 pr-4 py-3 calendly-body-sm transition-all duration-200"
                    style={{ 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: 'white'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4285f4';
                      e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={sentimentFilter}
                  onChange={(e) => setSentimentFilter(e.target.value as any)}
                  className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                  style={{ border: '1px solid #e2e8f0', background: 'white' }}
                >
                  <option value="all">All Sentiments</option>
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                  style={{ border: '1px solid #e2e8f0', background: 'white' }}
                >
                  <option value="all">All Status</option>
                  <option value="analyzed">Analyzed</option>
                  <option value="transcribed">Transcribed</option>
                  <option value="processing">Processing</option>
                  <option value="recorded">Recorded</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                  style={{ border: '1px solid #e2e8f0', background: 'white' }}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-2 transition-all duration-200 ${viewMode === 'cards' ? 'text-white' : 'calendly-body-sm'}`}
                    style={viewMode === 'cards' ? { background: '#4285f4' } : { color: '#718096' }}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 transition-all duration-200 ${viewMode === 'table' ? 'text-white' : 'calendly-body-sm'}`}
                    style={viewMode === 'table' ? { background: '#4285f4' } : { color: '#718096' }}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Meetings Display */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  onClick={() => handleMeetingClick(meeting.id)}
                  className="calendly-card cursor-pointer transition-all duration-200"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)';
                  }}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
                    <div className="flex-1">
                      <h3 className="calendly-h3" style={{ marginBottom: '4px' }}>{meeting.title}</h3>
                      <p className="calendly-label-sm">{meeting.customer} • {formatDistanceToNow(new Date(meeting.date), { addSuffix: true })}</p>
                    </div>
                    <div className="flex flex-col space-y-1 ml-4">
                      <span className={`calendly-badge ${getSentimentColor(meeting.sentiment)}`}>
                        {meeting.sentiment}
                      </span>
                      <span className={`calendly-badge ${getPriorityColor(meeting.priority)}`}>
                        {meeting.priority}
                      </span>
                    </div>
                  </div>

                  {/* Meeting Details */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600" style={{ marginBottom: '12px' }}>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{meeting.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{meeting.attendees.length} attendees</span>
                    </div>
                    <span className={`calendly-badge ${getStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="calendly-body-sm line-clamp-2" style={{ marginBottom: '16px' }}>
                    {meeting.summary}
                  </p>

                  {/* Key Topics */}
                  <div style={{ marginBottom: '16px' }}>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Key Topics</h5>
                    <div className="flex flex-wrap gap-2">
                      {meeting.keyTopics.slice(0, 3).map((topic, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {topic}
                        </span>
                      ))}
                      {meeting.keyTopics.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{meeting.keyTopics.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer with Actions */}
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="calendly-label-sm">{meeting.actionItems.length} action items</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {meeting.recording_url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(meeting.recording_url, '_blank');
                          }}
                          className="p-1 rounded transition-colors"
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
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <ExternalLink className="w-4 h-4" style={{ color: '#718096' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="calendly-card" style={{ padding: 0 }}>
              <div className="overflow-x-auto">
                <table className="calendly-table">
                  <thead>
                    <tr>
                      <th>Meeting</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Duration</th>
                      <th>Sentiment</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMeetings.map((meeting) => (
                      <tr key={meeting.id} className="cursor-pointer" onClick={() => handleMeetingClick(meeting.id)}>
                        <td>
                          <div>
                            <div className="font-medium">{meeting.title}</div>
                            <div className="text-sm text-gray-600 line-clamp-1">{meeting.summary}</div>
                          </div>
                        </td>
                        <td>{meeting.customer}</td>
                        <td>{formatDistanceToNow(new Date(meeting.date), { addSuffix: true })}</td>
                        <td>{meeting.duration}</td>
                        <td>
                          <span className={`calendly-badge ${getSentimentColor(meeting.sentiment)}`}>
                            {meeting.sentiment}
                          </span>
                        </td>
                        <td>
                          <span className={`calendly-badge ${getStatusColor(meeting.status)}`}>
                            {meeting.status}
                          </span>
                        </td>
                        <td>
                          <span className={`calendly-badge ${getPriorityColor(meeting.priority)}`}>
                            {meeting.priority}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center space-x-1">
                            {meeting.recording_url && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(meeting.recording_url, '_blank');
                                }}
                                className="p-1 rounded transition-colors"
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
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMeetingClick(meeting.id);
                              }}
                              className="p-1 rounded transition-colors"
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
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredMeetings.length === 0 && (
            <div className="calendly-card text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
              <h3 className="calendly-h3" style={{ marginBottom: '8px' }}>No meetings found</h3>
              <p className="calendly-body" style={{ marginBottom: '24px' }}>
                {searchQuery || sentimentFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your search or filters' 
                  : 'Meeting recordings will appear here once they are processed by Grain'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}