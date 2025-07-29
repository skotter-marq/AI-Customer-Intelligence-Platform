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
  Activity,
  Settings,
  Bot,
  Trash2,
  X,
  FileText,
  Plus,
  Database,
  Building,
  Upload,
  User
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
  coda_integrated?: boolean;
  coda_request_id?: string;
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
  const [codaFilter, setCodaFilter] = useState<'all' | 'integrated' | 'not_integrated'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [sortBy, setSortBy] = useState<'date' | 'customer' | 'duration' | 'sentiment'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<GrainMeeting | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCodaModal, setShowCodaModal] = useState(false);
  const [meetingForCoda, setMeetingForCoda] = useState<GrainMeeting | null>(null);
  const [isCreatingCodaRow, setIsCreatingCodaRow] = useState(false);
  const [selectedMeetings, setSelectedMeetings] = useState<string[]>([]);
  const [codaConfig, setCodaConfig] = useState({
    docId: 'qMDWed38ry', // Default to Product Roadmap
    tableId: 'grid-ii5pzK6H7w', // Default to Interviewed customers table
    columns: [
      { id: 'c-rZ9KroAK5e', name: 'Name' },
      { id: 'c-vIgbOysVdU', name: 'Email address' },
      { id: 'c-Fm0EQERoEQ', name: 'Account' },
      { id: 'c-9QAVp1D0Vv', name: 'Role' },
      { id: 'c-6UgdhS-BN0', name: 'Date of call' },
      { id: 'c-NISD-nFt6K', name: 'Gift card sent' },
      { id: 'c-KeO9E7V57Q', name: 'Interviewer' },
      { id: 'c-84-L8-GBf3', name: 'Recording' },
      { id: 'c-EFo_Dk_1dB', name: 'Status' },
      { id: 'c-VpdCbwFm_K', name: 'JTBD 1' },
      { id: 'c-4sgB2S4YX_', name: 'JTBD 2' },
      { id: 'c-4p8N8gfHPG', name: 'JTBD 3' },
      { id: 'c-FW2h08JQs6', name: 'JTBD 4' },
      { id: 'c-VRzJAsL1-o', name: 'Key takeaways' },
      { id: 'c-cF06vfxygT', name: 'CSAT' },
      { id: 'c-a8UzeBYJV5', name: 'Initiatives | MASTER LIST' }
    ]
  });
  const [showAdvancedCoda, setShowAdvancedCoda] = useState(false);
  const [aiAnalysisConfig, setAiAnalysisConfig] = useState({
    enabled: true, // Always enabled for simplified flow
    jtbdQuestions: [
      { description: "", keywords: "" },
      { description: "", keywords: "" },
      { description: "", keywords: "" },
      { description: "", keywords: "" }
    ],
    customQuestions: [],
    extractionRules: {}
  });

  // Upload transcript state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploadingTranscript, setIsUploadingTranscript] = useState(false);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [transcriptContent, setTranscriptContent] = useState('');
  const [uploadFormData, setUploadFormData] = useState({
    meetingTitle: '',
    customer: '',
    attendees: '',
    duration: '',
    recordingUrl: '',
    meetingDate: new Date().toISOString().split('T')[0]
  });

  // Form data for Coda columns (AI will generate JTBD and Key Takeaways)
  const [codaFormData, setCodaFormData] = useState({
    name: '',
    email: '',
    account: '',
    role: '',
    interviewer: '',
    csat: '',
    status: 'New Interview'
  });

  // Load Coda config from localStorage after component mounts
  useEffect(() => {
    setCodaConfig({
      docId: localStorage.getItem('coda-doc-id') || '',
      tableId: localStorage.getItem('coda-table-id') || ''
    });
  }, []);

  useEffect(() => {
    if (searchMode === 'browse') {
      fetchMeetingsData();
    }
  }, [sentimentFilter, statusFilter, dateFilter, codaFilter, searchMode]);

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
          tags: meeting.tags,
          coda_integrated: meeting.coda_integrated || false,
          coda_request_id: meeting.coda_request_id
        }));
        
        setMeetings(transformedMeetings);
      } else {
        console.error('Failed to fetch meetings:', data.error);
        setMeetings([]);
      }
    } catch (error) {
      console.error('API error:', error);
      setMeetings([]);
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
    const matchesCoda = codaFilter === 'all' || 
      (codaFilter === 'integrated' && meeting.coda_integrated) ||
      (codaFilter === 'not_integrated' && !meeting.coda_integrated);
    
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
    
    return matchesSearch && matchesSentiment && matchesStatus && matchesDate && matchesCoda;
  }) : [];

  const handleMeetingClick = (meetingId: string) => {
    // Navigate to meeting detail page
    router.push(`/meetings/${meetingId}`);
  };

  const handleDeleteClick = (meeting: GrainMeeting, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation to meeting detail
    setMeetingToDelete(meeting);
    setShowDeleteModal(true);
  };

  const handleSelectMeeting = (meetingId: string) => {
    setSelectedMeetings(prev => 
      prev.includes(meetingId) 
        ? prev.filter(id => id !== meetingId)
        : [...prev, meetingId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMeetings.length === filteredMeetings.length) {
      setSelectedMeetings([]);
    } else {
      setSelectedMeetings(filteredMeetings.map(m => m.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMeetings.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedMeetings.length} meeting${selectedMeetings.length !== 1 ? 's' : ''}? This action cannot be undone.`)) {
      try {
        const promises = selectedMeetings.map(id => 
          fetch(`/api/meetings?id=${id}`, { method: 'DELETE' })
        );
        
        await Promise.all(promises);
        
        // Remove from local state
        setMeetings(prev => prev.filter(m => !selectedMeetings.includes(m.id)));
        setSelectedMeetings([]);
      } catch (error) {
        console.error('Error bulk deleting meetings:', error);
        alert('Failed to delete meetings. Please try again.');
      }
    }
  };

  const handleBulkAddToCoda = () => {
    if (selectedMeetings.length === 0) return;
    
    // For now, we'll just show an alert. In a real implementation, 
    // you'd open a bulk Coda modal or process them all
    alert(`Add ${selectedMeetings.length} meeting${selectedMeetings.length !== 1 ? 's' : ''} to Coda - Feature coming soon!`);
  };

  const handleDeleteConfirm = async () => {
    if (!meetingToDelete) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/meetings?id=${meetingToDelete.id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Meeting deleted:', result.deletedMeeting.title);
        
        // Remove the meeting from the local state
        setMeetings(prev => prev.filter(m => m.id !== meetingToDelete.id));
        
        // Close modal
        setShowDeleteModal(false);
        setMeetingToDelete(null);
        
        // Show success message (optional - could add toast notification)
        console.log(`Meeting "${meetingToDelete.title}" deleted successfully`);
        
      } else {
        console.error('Failed to delete meeting:', result.error);
        alert('Failed to delete meeting: ' + result.error);
      }
      
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('Error deleting meeting. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setMeetingToDelete(null);
  };

  const handleCodaClick = (meeting: GrainMeeting, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation to meeting detail
    setMeetingForCoda(meeting);
    
    // Pre-populate form with meeting data
    setCodaFormData({
      name: meeting.customer || '',
      email: '', // To be filled by user
      account: meeting.customer || '',
      role: '', // To be filled by user
      interviewer: '', // To be filled by user
      csat: '', // To be filled by user
      status: 'New Interview'
    });
    
    setShowCodaModal(true);
  };

  const handleCodaCreate = async () => {
    if (!meetingForCoda || !codaConfig.docId || !codaConfig.tableId) {
      alert('Please configure Coda document and table IDs first');
      return;
    }
    
    setIsCreatingCodaRow(true);
    
    try {
      const response = await fetch('/api/coda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_research_initiative',
          meetingId: meetingForCoda.id,
          docId: codaConfig.docId,
          tableId: codaConfig.tableId
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Research initiative created in Coda:', result.requestId);
        
        // Close modal
        setShowCodaModal(false);
        setMeetingForCoda(null);
        
        // Show success message with link to Coda
        if (result.codaUrl) {
          const openCoda = confirm(
            `Research initiative created successfully in Coda!\n\n` +
            `Meeting: "${meetingForCoda.title}"\n` +
            `Request ID: ${result.requestId}\n\n` +
            `Would you like to open the Coda document?`
          );
          
          if (openCoda) {
            window.open(result.codaUrl, '_blank');
          }
        } else {
          alert(`Research initiative created successfully!\nRequest ID: ${result.requestId}`);
        }
        
      } else {
        console.error('Failed to create research initiative:', result.error);
        alert('Failed to create research initiative: ' + result.error);
      }
      
    } catch (error) {
      console.error('Error creating research initiative:', error);
      alert('Error creating research initiative. Please try again.');
    } finally {
      setIsCreatingCodaRow(false);
    }
  };

  const handleCodaCancel = () => {
    setShowCodaModal(false);
    setMeetingForCoda(null);
  };

  const saveCodaConfig = () => {
    localStorage.setItem('coda-doc-id', codaConfig.docId);
    localStorage.setItem('coda-table-id', codaConfig.tableId);
  };

  // Removed fetchCodaColumns - using hardcoded default table structure

  const handleEnhancedCodaCreate = async () => {
    if (!meetingForCoda || !codaConfig.docId || !codaConfig.tableId) {
      alert('Please configure Coda document and table IDs first');
      return;
    }
    
    setIsCreatingCodaRow(true);
    
    try {
      const requestBody: any = {
        action: 'create_research_initiative',
        meetingId: meetingForCoda.id,
        docId: codaConfig.docId,
        tableId: codaConfig.tableId,
        formData: codaFormData
      };

      // Add AI analysis configuration if enabled
      if (aiAnalysisConfig.enabled) {
        requestBody.aiAnalysisConfig = aiAnalysisConfig;
      }

      const response = await fetch('/api/coda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Enhanced research initiative created in Coda:', result.requestId);
        
        // Close modal
        setShowCodaModal(false);
        setMeetingForCoda(null);
        
        // Show success message with AI analysis info
        let message = `Research initiative created successfully in Coda!\n\n`;
        message += `Meeting: "${meetingForCoda.title}"\n`;
        message += `Request ID: ${result.requestId}\n`;
        
        if (aiAnalysisConfig.enabled) {
          message += `\n🧠 AI Analysis included:\n`;
          if (aiAnalysisConfig.jtbdQuestions.length > 0) {
            message += `• JTBD insights for ${aiAnalysisConfig.jtbdQuestions.length} questions\n`;
          }
          if (aiAnalysisConfig.customQuestions.length > 0) {
            message += `• Custom research for ${aiAnalysisConfig.customQuestions.length} questions\n`;
          }
        }
        
        message += `\nWould you like to open the Coda document?`;
        
        const openCoda = confirm(message);
        if (openCoda && result.codaUrl) {
          window.open(result.codaUrl, '_blank');
        }
        
      } else {
        console.error('Failed to create research initiative:', result.error);
        alert('Failed to create research initiative: ' + result.error);
      }
      
    } catch (error) {
      console.error('Error creating research initiative:', error);
      alert('Error creating research initiative. Please try again.');
    } finally {
      setIsCreatingCodaRow(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.name.toLowerCase().endsWith('.txt') && file.type !== 'text/plain') {
      alert('Please upload a .txt file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setTranscriptFile(file);

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTranscriptContent(content);
    };
    reader.readAsText(file);
  };

  const handleUploadTranscript = async () => {
    if (!uploadFormData.meetingTitle || !uploadFormData.customer || !transcriptContent) {
      alert('Please fill in the required fields: Meeting Title, Customer, and upload a transcript file');
      return;
    }
    
    setIsUploadingTranscript(true);
    
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload_transcript',
          meetingData: {
            title: uploadFormData.meetingTitle,
            customer: uploadFormData.customer,
            date: uploadFormData.meetingDate,
            duration: uploadFormData.duration || '30 minutes',
            attendees: uploadFormData.attendees.split(',').map(a => a.trim()).filter(Boolean),
            recording_url: uploadFormData.recordingUrl || null,
            transcript: transcriptContent,
            status: 'transcribed' // Start with transcribed status, will move to analyzed after AI processing
          },
          aiAnalysisConfig: aiAnalysisConfig.enabled ? aiAnalysisConfig : null
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Transcript uploaded and AI analysis initiated:', result.meetingId);
        
        // Add the new meeting to the list
        const newMeeting: GrainMeeting = {
          id: result.meetingId,
          title: uploadFormData.meetingTitle,
          customer: uploadFormData.customer,
          date: uploadFormData.meetingDate,
          duration: uploadFormData.duration || '30 minutes',
          attendees: uploadFormData.attendees.split(',').map(a => a.trim()).filter(Boolean),
          recording_url: uploadFormData.recordingUrl || undefined,
          transcript_url: undefined,
          sentiment: 'neutral' as const, // Will be updated by AI analysis
          summary: 'Processing transcript...', // Will be updated by AI analysis
          keyTopics: [], // Will be updated by AI analysis
          actionItems: [], // Will be updated by AI analysis
          status: 'processing' as const, // Changed to processing since AI analysis is running
          priority: 'medium' as const,
          tags: [],
          coda_integrated: false
        };
        
        setMeetings(prev => [newMeeting, ...prev]);
        
        // Close modal and reset form
        setShowUploadModal(false);
        setUploadFormData({
          meetingTitle: '',
          customer: '',
          attendees: '',
          duration: '',
          recordingUrl: '',
          meetingDate: new Date().toISOString().split('T')[0]
        });
        setTranscriptFile(null);
        setTranscriptContent('');
        
        // Show success message
        alert(
          `Transcript uploaded successfully!\n\n` +
          `Meeting: "${uploadFormData.meetingTitle}"\n` +
          `Meeting ID: ${result.meetingId}\n\n` +
          `🧠 AI analysis is now processing the transcript. The meeting status will update to "analyzed" once complete.\n\n` +
          `The meeting has been added to your meetings list and you can view it there.`
        );
        
      } else {
        console.error('Failed to upload transcript:', result.error);
        alert('Failed to upload transcript: ' + result.error);
      }
      
    } catch (error) {
      console.error('Error uploading transcript:', error);
      alert('Error uploading transcript. Please try again.');
    } finally {
      setIsUploadingTranscript(false);
    }
  };

  const handleUploadCancel = () => {
    setShowUploadModal(false);
    setUploadFormData({
      meetingTitle: '',
      customer: '',
      attendees: '',
      duration: '',
      recordingUrl: '',
      meetingDate: new Date().toISOString().split('T')[0]
    });
    setTranscriptFile(null);
    setTranscriptContent('');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#0f71e5' }}></div>
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
              <button 
                onClick={() => setShowUploadModal(!showUploadModal)}
                className={`${showUploadModal ? 'calendly-btn-secondary' : 'calendly-btn-primary'} flex items-center space-x-2`}
              >
                <Plus className="w-4 h-4" />
                <span>{showUploadModal ? 'Cancel Upload' : 'Upload Transcript'}</span>
              </button>
              <button 
                onClick={() => setShowAIConfig(true)}
                className="calendly-btn-secondary flex items-center space-x-2"
              >
                <Bot className="w-4 h-4" />
                <span>Configure AI</span>
              </button>
              <button className="calendly-btn-secondary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Inline Upload Transcript Form */}
          {showUploadModal && (
            <div className="calendly-card" style={{ marginBottom: '24px' }}>
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="calendly-h3">Upload Meeting Transcript</h3>
                      <p className="calendly-body-sm text-gray-600">Upload a transcript file and initiate AI analysis</p>
                    </div>
                  </div>
                  <button
                    onClick={handleUploadCancel}
                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                    disabled={isUploadingTranscript}
                    title="Close"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* AI Analysis Info */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      🧠 Upload a .txt file with your meeting transcript. AI will automatically extract insights, 
                      sentiment, action items, and generate a comprehensive summary.
                    </p>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title *</label>
                      <input
                        type="text"
                        value={uploadFormData.meetingTitle}
                        onChange={(e) => setUploadFormData(prev => ({ ...prev, meetingTitle: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Customer Discovery Call - Acme Corp"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                      <input
                        type="text"
                        value={uploadFormData.customer}
                        onChange={(e) => setUploadFormData(prev => ({ ...prev, customer: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Acme Corp"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Date</label>
                      <input
                        type="date"
                        value={uploadFormData.meetingDate}
                        onChange={(e) => setUploadFormData(prev => ({ ...prev, meetingDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <input
                        type="text"
                        value={uploadFormData.duration}
                        onChange={(e) => setUploadFormData(prev => ({ ...prev, duration: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="30 minutes"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
                      <input
                        type="text"
                        value={uploadFormData.attendees}
                        onChange={(e) => setUploadFormData(prev => ({ ...prev, attendees: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John Smith, Jane Doe (comma-separated)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Recording URL</label>
                      <input
                        type="url"
                        value={uploadFormData.recordingUrl}
                        onChange={(e) => setUploadFormData(prev => ({ ...prev, recordingUrl: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transcript File *</label>
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                      <div className="space-y-1 text-center">
                        {transcriptFile ? (
                          <div className="flex flex-col items-center">
                            <FileText className="w-8 h-8 text-blue-500 mb-2" />
                            <div className="text-sm font-medium text-gray-900">{transcriptFile.name}</div>
                            <div className="text-xs text-gray-500">{(transcriptFile.size / 1024).toFixed(1)} KB</div>
                            <div className="text-xs text-green-600 mt-1">✓ File loaded successfully</div>
                            <button
                              type="button"
                              onClick={() => {
                                setTranscriptFile(null);
                                setTranscriptContent('');
                              }}
                              className="text-xs text-red-600 hover:text-red-700 mt-2"
                            >
                              Remove file
                            </button>
                          </div>
                        ) : (
                          <div>
                            <FileText className="mx-auto h-10 w-10 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="transcript-file"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                              >
                                <span>Upload a transcript file</span>
                                <input
                                  id="transcript-file"
                                  name="transcript-file"
                                  type="file"
                                  className="sr-only"
                                  accept=".txt,text/plain"
                                  onChange={handleFileUpload}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">TXT files up to 10MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      🤖 Analysis starts immediately after upload
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleUploadCancel}
                        className="calendly-btn-secondary"
                        disabled={isUploadingTranscript}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUploadTranscript}
                        className="px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ 
                          backgroundColor: '#0f71e5',
                          fontFamily: 'Poppins, sans-serif'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0d5fb8'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f71e5'}
                        disabled={isUploadingTranscript || !uploadFormData.meetingTitle || !uploadFormData.customer || !transcriptContent}
                      >
                        {isUploadingTranscript && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        <Plus className="w-4 h-4" />
                        <span>{isUploadingTranscript ? 'Processing...' : 'Upload & Analyze'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Total Meetings</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{meetings.length}</p>
                </div>
                <MessageSquare className="w-8 h-8" style={{ color: '#0f71e5' }} />
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: isSearching ? '#0f71e5' : '#718096' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchQueryChange(e.target.value)}
                    placeholder={searchMode === 'search' ? 'Search transcripts, topics, insights...' : 'Search meetings, customers, or topics...'}
                    className="w-full pl-12 pr-4 py-3 calendly-body-sm transition-all duration-200"
                    style={{ 
                      border: `1px solid ${searchMode === 'search' ? '#0f71e5' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      background: 'white'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0f71e5';
                      e.target.style.boxShadow = '0 0 0 3px rgba(15, 113, 229, 0.1)';
                      if (searchQuery.trim().length >= 2) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={(e) => {
                      setTimeout(() => {
                        e.target.style.borderColor = searchMode === 'search' ? '#0f71e5' : '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                        setShowSuggestions(false);
                      }, 200);
                    }}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: '#0f71e5' }}></div>
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
                <select
                  value={codaFilter}
                  onChange={(e) => setCodaFilter(e.target.value as any)}
                  className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                  style={{ border: '1px solid #e2e8f0', background: 'white' }}
                >
                  <option value="all">All Meetings</option>
                  <option value="integrated">Added to Coda</option>
                  <option value="not_integrated">Not in Coda</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-2 transition-all duration-200 ${viewMode === 'cards' ? 'text-white' : 'calendly-body-sm'}`}
                    style={viewMode === 'cards' ? { background: '#0f71e5' } : { color: '#718096' }}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 transition-all duration-200 ${viewMode === 'table' ? 'text-white' : 'calendly-body-sm'}`}
                    style={viewMode === 'table' ? { background: '#0f71e5' } : { color: '#718096' }}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {filteredMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  onClick={() => handleMeetingClick(meeting.id)}
                  className="calendly-card cursor-pointer transition-all duration-200 h-[420px] flex flex-col"
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
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{meeting.title}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="w-4 h-4 mr-1" />
                        <span className="truncate">{meeting.customer}</span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1 ml-3">
                      <span className={`calendly-badge text-xs ${getSentimentColor(meeting.sentiment)}`}>
                        {meeting.sentiment}
                      </span>
                      <span className={`calendly-badge text-xs ${getStatusColor(meeting.status)}`}>
                        {meeting.status}
                      </span>
                    </div>
                  </div>

                  {/* Meeting Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center text-gray-600 mb-1">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Duration</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{meeting.duration}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center text-gray-600 mb-1">
                        <Users className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">Attendees</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{meeting.attendees.length}</p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-blue-50 p-3 rounded-lg mb-3 flex-1">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Summary</h4>
                    <p className="text-sm text-blue-800 line-clamp-3">
                      {meeting.summary}
                    </p>
                  </div>

                  {/* Key Topics */}
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Key Topics</h4>
                    <div className="flex flex-wrap gap-1">
                      {meeting.keyTopics.slice(0, 3).map((topic, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {topic}
                        </span>
                      ))}
                      {meeting.keyTopics.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{meeting.keyTopics.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer with Actions */}
                  <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className="text-sm">{new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">{meeting.actionItems.length} actions</span>
                      </div>
                      {meeting.coda_integrated && (
                        <div className="flex items-center text-green-600">
                          <Database className="w-4 h-4 mr-1" />
                          <span className="text-sm">Coda</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      {meeting.recording_url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(meeting.recording_url, '_blank');
                          }}
                          className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                          title="Play recording"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Recording
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteClick(meeting, e)}
                        className="flex items-center text-red-600 hover:text-red-800 font-medium text-sm"
                        title="Delete meeting"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchMode === 'browse' ? (
            <>
            {/* Bulk Actions Toolbar */}
            {selectedMeetings.length > 0 && (
              <div className="p-4 mb-4 flex items-center justify-between" style={{
                background: '#dbeafe',
                border: '1px solid #93c5fd', 
                borderRadius: '12px'
              }}>
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-blue-900">
                    {selectedMeetings.length} meeting{selectedMeetings.length !== 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleBulkAddToCoda}
                      className="calendly-btn-primary flex items-center space-x-1"
                    >
                      <Database className="w-4 h-4" />
                      <span className="text-sm font-medium">Add to Coda</span>
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="calendly-btn-secondary flex items-center space-x-1 !text-red-600 !border-red-200 hover:!bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Delete All</span>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMeetings([])}
                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Clear selection"
                >
                  <X className="w-4 h-4 text-blue-700" />
                </button>
              </div>
            )}
            
            {/* Enhanced List View */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {filteredMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    onClick={() => handleMeetingClick(meeting.id)}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer relative"
                  >
                    {/* Selection Circle */}
                    <div className="absolute top-6 left-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectMeeting(meeting.id);
                        }}
                        className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                          selectedMeetings.includes(meeting.id)
                            ? 'bg-blue-600 border-blue-600 shadow-lg'
                            : 'bg-white border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {selectedMeetings.includes(meeting.id) && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </button>
                    </div>

                    <div className="ml-8">{/* Add margin for the selection circle */}
                    <div className="flex items-center justify-between">
                      {/* Left Content */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{meeting.title}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getSentimentColor(meeting.sentiment)}`}>
                              {meeting.sentiment}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(meeting.status)}`}>
                              {meeting.status}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(meeting.priority)}`}>
                              {meeting.priority}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-1 mb-3">{meeting.summary}</p>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Building className="w-4 h-4" />
                            <span>{meeting.customer}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{meeting.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{meeting.attendees.length} attendees</span>
                          </div>
                          {meeting.coda_integrated && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <Database className="w-4 h-4" />
                              <span>Coda</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center space-x-3 ml-6">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMeetingClick(meeting.id);
                          }}
                          className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                        {meeting.recording_url && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(meeting.recording_url, '_blank');
                            }}
                            className="flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                            title="Play recording"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Recording
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDeleteClick(meeting, e)}
                          className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete meeting"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </>
          ) : null}

          {/* Empty State */}
          {searchMode === 'browse' && filteredMeetings.length === 0 && (
            <div className="calendly-card text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
              <h3 className="calendly-h3" style={{ marginBottom: '8px' }}>No meetings found</h3>
              <p className="calendly-body" style={{ marginBottom: '24px' }}>
                {searchQuery || sentimentFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all' || codaFilter !== 'all'
                  ? 'Try adjusting your search or filters' 
                  : 'Meeting recordings will appear here once they are processed by Grain'}
              </p>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && meetingToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="calendly-h3">Delete Meeting</h2>
                      <p className="calendly-body-sm text-gray-600">This action cannot be undone</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDeleteCancel}
                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                    disabled={isDeleting}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  <p className="calendly-body mb-4">
                    Are you sure you want to delete this meeting? This will permanently remove:
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">{meetingToDelete.title}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Customer: {meetingToDelete.customer}</div>
                      <div>Date: {formatDistanceToNow(new Date(meetingToDelete.date), { addSuffix: true })}</div>
                      <div>Duration: {meetingToDelete.duration}</div>
                    </div>
                  </div>

                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    <li>• Meeting transcript and recording links</li>
                    <li>• AI-generated insights and analysis</li>
                    <li>• Action items and follow-ups</li>
                    <li>• All associated meeting data</li>
                  </ul>

                  <p className="calendly-body-sm text-red-600 font-medium">
                    This action cannot be undone.
                  </p>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
                  <button
                    onClick={handleDeleteCancel}
                    className="calendly-btn-secondary"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isDeleting}
                  >
                    {isDeleting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <Trash2 className="w-4 h-4" />
                    <span>{isDeleting ? 'Deleting...' : 'Delete Meeting'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Coda Research Initiative Modal */}
          {showCodaModal && meetingForCoda && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="calendly-h3">Create Research Initiative</h2>
                      <p className="calendly-body-sm text-gray-600">Add this meeting to your Coda research table with AI analysis</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCodaCancel}
                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                    disabled={isCreatingCodaRow}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-auto p-6">
                  <div className="max-w-2xl mx-auto">
                    <div className="space-y-6">
                      
                      {/* Meeting Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{meetingForCoda.title}</h4>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Customer:</span> {meetingForCoda.customer} • 
                          <span className="font-medium ml-2">Date:</span> {formatDistanceToNow(new Date(meetingForCoda.date), { addSuffix: true })} • 
                          <span className="font-medium ml-2">Duration:</span> {meetingForCoda.duration}
                        </div>
                      </div>

                      {/* Connection Info */}
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h3 className="font-medium text-green-900 mb-2">📋 Connected to Coda</h3>
                        <p className="text-sm text-green-800">
                          Creating interview row in <strong>Product Roadmap</strong> → <strong>Interviewed customers</strong>
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          ✨ AI will automatically analyze the transcript and fill JTBD insights + key takeaways
                        </p>
                      </div>

                      {/* Form Fields */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-900">Interview Details</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                              type="text"
                              value={codaFormData.name}
                              onChange={(e) => setCodaFormData(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Customer name"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <input
                              type="email"
                              value={codaFormData.email}
                              onChange={(e) => setCodaFormData(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="customer@company.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account *</label>
                            <input
                              type="text"
                              value={codaFormData.account}
                              onChange={(e) => setCodaFormData(prev => ({ ...prev, account: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Company name"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <input
                              type="text"
                              value={codaFormData.role}
                              onChange={(e) => setCodaFormData(prev => ({ ...prev, role: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Job title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Interviewer</label>
                            <input
                              type="text"
                              value={codaFormData.interviewer}
                              onChange={(e) => setCodaFormData(prev => ({ ...prev, interviewer: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Your name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CSAT Rating</label>
                            <select
                              value={codaFormData.csat}
                              onChange={(e) => setCodaFormData(prev => ({ ...prev, csat: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select rating</option>
                              <option value="5">5 - Very Satisfied</option>
                              <option value="4">4 - Satisfied</option>
                              <option value="3">3 - Neutral</option>
                              <option value="2">2 - Dissatisfied</option>
                              <option value="1">1 - Very Dissatisfied</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* AI Analysis Configuration */}
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h3 className="font-medium text-blue-900 mb-2">🧠 AI Analysis</h3>
                          <p className="text-sm text-blue-800 mb-4">
                            Configure the JTBD questions that AI will analyze from the meeting transcript:
                          </p>
                          
                          <div className="space-y-3">
                            {aiAnalysisConfig.jtbdQuestions.map((jtbd, index) => (
                              <div key={index} className="space-y-2">
                                <label className="text-sm font-medium text-blue-800">JTBD {index + 1}:</label>
                                <textarea
                                  value={jtbd.description}
                                  onChange={(e) => {
                                    const updated = [...aiAnalysisConfig.jtbdQuestions];
                                    updated[index].description = e.target.value;
                                    setAiAnalysisConfig(prev => ({ ...prev, jtbdQuestions: updated }));
                                  }}
                                  placeholder={`e.g., "I need to ${index === 0 ? 'access content effectively' : index === 1 ? 'manage images efficiently' : index === 2 ? 'incorporate data accurately' : 'optimize my workflow'} so I can..."`}
                                  className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  rows={2}
                                />
                                <input
                                  type="text"
                                  value={jtbd.keywords}
                                  onChange={(e) => {
                                    const updated = [...aiAnalysisConfig.jtbdQuestions];
                                    updated[index].keywords = e.target.value;
                                    setAiAnalysisConfig(prev => ({ ...prev, jtbdQuestions: updated }));
                                  }}
                                  placeholder="Keywords to look for (comma-separated)"
                                  className="w-full px-3 py-1 text-xs border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                            <p className="text-xs text-blue-700">
                              💡 AI will also automatically generate comprehensive <strong>Key Takeaways</strong> with quotes and insights from the entire conversation.
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                  <div className="text-sm text-gray-600">
                    🧠 AI will automatically analyze the transcript and generate JTBD insights + key takeaways
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleCodaCancel}
                      className="calendly-btn-secondary"
                      disabled={isCreatingCodaRow}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEnhancedCodaCreate}
                      className="px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        backgroundColor: '#0f71e5',
                        fontFamily: 'Poppins, sans-serif'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0d5fb8'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f71e5'}
                      disabled={isCreatingCodaRow || !codaConfig.docId || !codaConfig.tableId}
                    >
                      {isCreatingCodaRow && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      <Plus className="w-4 h-4" />
                      <span>{isCreatingCodaRow ? 'Creating...' : 'Create Initiative'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Configuration Modal */}
          {showAIConfig && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <div className="flex items-center space-x-3">
                    <Bot className="w-6 h-6" style={{ color: '#0f71e5' }} />
                    <div>
                      <h2 className="calendly-h2">AI Analysis Configuration</h2>
                      <p className="calendly-body-sm text-gray-600">Current settings and status for meeting analysis</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAIConfig(false)}
                    className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-auto p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Current Status */}
                    <div>
                      <h3 className="calendly-h3 mb-4 flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        Analysis Status
                      </h3>
                      
                      <div className="space-y-4">
                        {/* AI Provider Status */}
                        <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-green-800">AI Provider</h4>
                            <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">Connected</span>
                          </div>
                          <p className="text-sm text-green-700">Claude 3.5 Sonnet (Anthropic)</p>
                          <p className="text-xs text-green-600 mt-1">Last used: 2 hours ago</p>
                        </div>

                        {/* Auto-Processing Status */}
                        <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-blue-800">Auto-Processing</h4>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600" style={{ backgroundColor: 'var(--marq-primary)' }}></div>
                            </label>
                          </div>
                          <p className="text-sm text-blue-700">New meetings analyzed automatically</p>
                          <p className="text-xs text-blue-600 mt-1">3 meetings processed today</p>
                        </div>

                        {/* Processing Statistics */}
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <h4 className="font-medium mb-3">Processing Statistics</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">This Week</div>
                              <div className="font-semibold text-lg">12 meetings</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Success Rate</div>
                              <div className="font-semibold text-lg text-green-600">98%</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Avg. Processing</div>
                              <div className="font-semibold text-lg">15 seconds</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Insights Generated</div>
                              <div className="font-semibold text-lg">47</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Prompts */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="calendly-h3 flex items-center">
                          <Settings className="w-5 h-5 text-gray-500 mr-2" />
                          Active Prompts
                        </h3>
                        <button 
                          onClick={() => {
                            setShowAIConfig(false);
                            router.push('/meetings/ai-prompts');
                          }}
                          className="calendly-btn-primary flex items-center space-x-2"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Edit Prompts</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* Main Analysis Prompt */}
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <h4 className="font-medium">Meeting Analysis</h4>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">v1.0</span>
                          </div>
                          <p className="text-sm text-gray-600">Comprehensive transcript analysis with insights extraction</p>
                          <p className="text-xs text-gray-500 mt-2">Last modified: 2 days ago</p>
                        </div>

                        {/* Sentiment Analysis */}
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <h4 className="font-medium">Sentiment Analysis</h4>
                            </div>
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">v1.2</span>
                          </div>
                          <p className="text-sm text-gray-600">Emotion and tone detection from conversations</p>
                          <p className="text-xs text-gray-500 mt-2">Last modified: 1 week ago</p>
                        </div>

                        {/* Action Items */}
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <h4 className="font-medium">Action Items</h4>
                            </div>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">v1.0</span>
                          </div>
                          <p className="text-sm text-gray-600">Follow-up tasks and commitment extraction</p>
                          <p className="text-xs text-gray-500 mt-2">Last modified: 1 week ago</p>
                        </div>

                        {/* Feature Requests */}
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <h4 className="font-medium">Feature Requests</h4>
                            </div>
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">v1.0</span>
                          </div>
                          <p className="text-sm text-gray-600">Product feedback and enhancement identification</p>
                          <p className="text-xs text-gray-500 mt-2">Last modified: 1 week ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                  <div className="text-sm text-gray-600 flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>All systems operational • Analysis running automatically</span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowAIConfig(false)}
                      className="calendly-btn-secondary"
                    >
                      Close
                    </button>
                    <button 
                      onClick={() => {
                        setShowAIConfig(false);
                        router.push('/meetings/ai-prompts');
                      }}
                      className="calendly-btn-primary"
                    >
                      Customize Prompts
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