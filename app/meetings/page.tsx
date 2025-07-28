'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [meetings, setMeetings] = useState<GrainMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchMode, setSearchMode] = useState<'browse' | 'search'>('browse');
  const [searchType, setSearchType] = useState<'all' | 'transcript' | 'topics' | 'insights' | 'actions'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sentimentFilter, setSentimentFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'recorded' | 'processing' | 'transcribed' | 'analyzed'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'date' | 'customer' | 'duration' | 'sentiment'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (searchMode === 'browse') {
      fetchMeetingsData();
    }
  }, [sentimentFilter, statusFilter, dateFilter, searchMode]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length >= 2 && searchMode === 'search') {
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchMode('browse');
    }
  }, [searchQuery, searchType, sentimentFilter, statusFilter, dateFilter]);

  // Search suggestions
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchSearchSuggestions();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  const fetchMeetingsData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sentimentFilter !== 'all') params.append('sentiment', sentimentFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFilter !== 'all') params.append('dateRange', dateFilter);
      params.append('limit', '50');

      const response = await fetch(`/api/meetings?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        // Transform API data to match component interface
        const transformedMeetings = data.meetings.map((meeting: any) => ({
          id: meeting.id,
          title: meeting.title,
          customer: meeting.customer,
          date: meeting.date,
          duration: meeting.duration,
          sentiment: meeting.sentiment as 'positive' | 'neutral' | 'negative',
          summary: meeting.summary,
          keyTopics: meeting.keyTopics,
          actionItems: meeting.actionItems,
          attendees: meeting.attendees,
          recording_url: meeting.recording_url,
          transcript_url: meeting.transcript_url,
          status: meeting.status as 'recorded' | 'processing' | 'transcribed' | 'analyzed',
          priority: meeting.priority as 'high' | 'medium' | 'low',
          tags: meeting.tags
        }));
        
        setMeetings(transformedMeetings);
      } else {
        // Using mock data (database not configured)
        console.info('Using mock meeting data - configure Supabase database for real data');
        setMeetings(mockMeetings);
      }
    } catch (error) {
      console.info('Using mock meeting data - API not available:', error.message);
      // Fallback to mock data
      setMeetings(mockMeetings);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    
    setIsSearching(true);
    setSearchMode('search');
    
    try {
      const params = new URLSearchParams();
      params.append('q', searchQuery.trim());
      params.append('type', searchType);
      params.append('limit', '20');
      
      if (sentimentFilter !== 'all') params.append('sentiment', sentimentFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFilter !== 'all') params.append('dateRange', dateFilter);

      const response = await fetch(`/api/meetings/search?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results);
        setShowSuggestions(false);
      } else {
        console.error('Search failed:', data.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchSearchSuggestions = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    
    try {
      const response = await fetch('/api/meetings/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_search_suggestions',
          query: searchQuery.trim()
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setSearchSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      if (searchMode === 'search') {
        setSearchMode('browse');
        setSearchResults([]);
      }
    }
  };

  const selectSuggestion = (suggestion: any) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    // Trigger search immediately
    setTimeout(() => performSearch(), 100);
  };

  // Mock meetings data (fallback)
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

  const filteredMeetings = searchMode === 'browse' ? meetings.filter(meeting => {
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
  }) : [];

  const handleMeetingClick = (meetingId: string) => {
    // Navigate to meeting detail page
    router.push(`/meetings/${meetingId}`);
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: isSearching ? '#4285f4' : '#718096' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchQueryChange(e.target.value)}
                    placeholder={searchMode === 'search' ? 'Search transcripts, topics, insights...' : 'Search meetings, customers, or topics...'}
                    className="w-full pl-12 pr-4 py-3 calendly-body-sm transition-all duration-200"
                    style={{ 
                      border: `1px solid ${searchMode === 'search' ? '#4285f4' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      background: 'white'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4285f4';
                      e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                      if (searchQuery.trim().length >= 2) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={(e) => {
                      setTimeout(() => {
                        e.target.style.borderColor = searchMode === 'search' ? '#4285f4' : '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                        setShowSuggestions(false);
                      }, 200);
                    }}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: '#4285f4' }}></div>
                    </div>
                  )}
                  
                  {/* Search Suggestions */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                      {searchSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => selectSuggestion(suggestion)}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-2"
                        >
                          <Search className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{suggestion.text}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{suggestion.category}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Search Type Selector (only show in search mode) */}
                {searchMode === 'search' && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-600">Search in:</span>
                      {(['all', 'transcript', 'topics', 'insights', 'actions'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setSearchType(type)}
                          className={`px-3 py-1 rounded-full text-xs transition-all ${
                            searchType === type 
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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

          {/* Search Results Display */}
          {searchMode === 'search' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="calendly-h3">Search Results</h3>
                  <p className="calendly-body-sm text-gray-600">
                    Found {searchResults.length} results for "{searchQuery}"
                    {searchType !== 'all' && ` in ${searchType}`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchMode('browse');
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="calendly-btn-secondary text-sm"
                >
                  Clear Search
                </button>
              </div>

              {/* Search Results */}
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <div key={index} className="calendly-card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="calendly-h4">{result.meeting_title}</h4>
                          <span className={`calendly-badge calendly-badge-info text-xs`}>
                            {result.search_type}
                          </span>
                        </div>
                        <p className="calendly-body-sm text-gray-600">
                          {result.customer_name} • {formatDistanceToNow(new Date(result.meeting_date), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {result.recording_url && (
                          <button
                            onClick={() => window.open(result.recording_url, '_blank')}
                            className="p-1 rounded transition-colors hover:bg-gray-100"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleMeetingClick(result.meeting_id)}
                          className="p-1 rounded transition-colors hover:bg-gray-100"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Display different content based on search type */}
                      {result.search_type === 'transcript' && result.excerpt && (
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <p className="text-gray-700">
                            <span className="font-medium">Transcript:</span> {result.excerpt}
                          </p>
                        </div>
                      )}

                      {result.search_type === 'topic' && (
                        <div className="bg-blue-50 p-3 rounded text-sm">
                          <p className="text-blue-800">
                            <span className="font-medium">Topic:</span> {result.topic_name}
                          </p>
                          {result.keywords && result.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.keywords.map((keyword: string, idx: number) => (
                                <span key={idx} className="bg-blue-200 text-blue-800 px-2 py-1 text-xs rounded">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {result.search_type === 'insight' && (
                        <div className="bg-green-50 p-3 rounded text-sm">
                          <p className="text-green-800">
                            <span className="font-medium">Insight:</span> {result.insight_title}
                          </p>
                          <p className="text-green-700 mt-1">{result.insight_description}</p>
                          {result.quote && (
                            <blockquote className="mt-2 italic text-green-600 border-l-2 border-green-300 pl-2">
                              "{result.quote}"
                            </blockquote>
                          )}
                        </div>
                      )}

                      {result.search_type === 'action_item' && (
                        <div className="bg-yellow-50 p-3 rounded text-sm">
                          <p className="text-yellow-800">
                            <span className="font-medium">Action Item:</span> {result.action_description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-yellow-700">
                            <span>Priority: {result.priority}</span>
                            <span>Status: {result.status}</span>
                            {result.due_date && (
                              <span>Due: {new Date(result.due_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {searchResults.length === 0 && !isSearching && searchQuery.trim().length >= 2 && (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <h3 className="calendly-h3 mb-2">No results found</h3>
                    <p className="calendly-body text-gray-600">
                      Try adjusting your search query or search type
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meetings Display */}
          {searchMode === 'browse' && viewMode === 'cards' ? (
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
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="calendly-label-sm">{meeting.actionItems.length} action items</span>
                      </div>
                      {/* JIRA Workflow Indicator */}
                      {meeting.status === 'analyzed' && (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="calendly-label-sm text-blue-600">JIRA Ready</span>
                          </div>
                        </div>
                      )}
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
          ) : searchMode === 'browse' ? (
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
          ) : null}

          {/* Empty State */}
          {searchMode === 'browse' && filteredMeetings.length === 0 && (
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