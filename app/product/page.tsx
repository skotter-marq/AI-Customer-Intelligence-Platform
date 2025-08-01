'use client';

import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search,
  Filter,
  Package,
  GitBranch,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Tag,
  ArrowUpDown,
  Grid3X3,
  List,
  Download,
  Eye,
  ExternalLink,
  Plus,
  Edit,
  Star,
  TrendingUp,
  Zap,
  Bug,
  Lightbulb,
  Settings,
  FileText,
  MessageSquare,
  Users,
  Activity,
  Slack
} from 'lucide-react';

interface ProductUpdate {
  id: string;
  title: string;
  description: string;
  jira_story_key: string;
  type: 'bug_fix' | 'feature_enhancement' | 'new_feature' | 'performance_improvement' | 'security_update';
  status: 'planning' | 'development' | 'testing' | 'deployed' | 'published';
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact_level: 'low' | 'medium' | 'high';
  release_version: string;
  completion_date?: string;
  published_at?: string;
  author: string;
  assigned_team: string;
  affected_customers: number;
  changelog_published: boolean;
  notification_sent: boolean;
  tags: string[];
  customer_feedback_score?: number;
  related_tickets: string[];
}

interface EnhancedChangelogEntry {
  id: string;
  version: string;
  release_date: string;
  category: 'Added' | 'Fixed' | 'Improved' | 'Deprecated' | 'Security';
  customer_facing_title: string;
  customer_facing_description: string;
  highlights: string[];
  breaking_changes: boolean;
  migration_notes?: string;
  view_count: number;
  upvotes: number;
  feedback_count: number;
  jira_story_key?: string;
  approval_status: 'pending' | 'approved' | 'published';
  public_visibility: boolean;
  layout_template?: 'standard' | 'feature_spotlight' | 'technical_update' | 'security_notice' | 'deprecation_warning' | 'minimal';
  // Optional media fields
  external_link?: string;
  video_url?: string;
  image_url?: string;
  // Related JIRA stories
  related_stories?: string[];
}

export default function ProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'changelog' | 'approval'>('changelog');
  const [productUpdates, setProductUpdates] = useState<ProductUpdate[]>([]);
  const [changelogEntries, setChangelogEntries] = useState<EnhancedChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<EnhancedChangelogEntry>>({});
  
  // Updates filters
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | string>('all');
  
  // Changelog filters
  const [versionFilter, setVersionFilter] = useState<'all' | string>('all');
  const [changelogTypeFilter, setChangelogTypeFilter] = useState<'all' | string>('all');
  
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [selectedUpdates, setSelectedUpdates] = useState<string[]>([]);
  const [selectedChangelogEntries, setSelectedChangelogEntries] = useState<string[]>([]);

  // Mock product updates data
  const mockProductUpdates: ProductUpdate[] = [
    {
      id: 'update-001',
      title: 'Enhanced Dashboard Analytics',
      description: 'Improved dashboard performance with real-time analytics and customizable widgets for better user experience.',
      jira_story_key: 'PLAT-245',
      type: 'feature_enhancement',
      status: 'deployed',
      priority: 'high',
      impact_level: 'high',
      release_version: 'v2.4.1',
      completion_date: '2024-01-15T10:30:00Z',
      published_at: '2024-01-15T14:00:00Z',
      author: 'Sarah Johnson',
      assigned_team: 'Frontend Team',
      affected_customers: 1250,
      changelog_published: true,
      notification_sent: true,
      tags: ['Dashboard', 'Analytics', 'Performance'],
      customer_feedback_score: 4.6,
      related_tickets: ['SUPP-123', 'SUPP-156']
    },
    {
      id: 'update-002',
      title: 'API Rate Limiting Implementation',
      description: 'Added comprehensive rate limiting to prevent API abuse and ensure fair usage across all customers.',
      jira_story_key: 'PLAT-267',
      type: 'security_update',
      status: 'testing',
      priority: 'critical',
      impact_level: 'medium',
      release_version: 'v2.4.2',
      completion_date: '2024-01-16T09:00:00Z',
      author: 'Mike Chen',
      assigned_team: 'Backend Team',
      affected_customers: 2100,
      changelog_published: false,
      notification_sent: false,
      tags: ['API', 'Security', 'Rate Limiting'],
      related_tickets: ['SUPP-189', 'SUPP-203']
    },
    {
      id: 'update-003',
      title: 'Mobile App Offline Mode',
      description: 'Users can now access critical features and view cached data when offline, syncing automatically when connection is restored.',
      jira_story_key: 'PLAT-189',
      type: 'new_feature',
      status: 'development',
      priority: 'medium',
      impact_level: 'high',
      release_version: 'v2.5.0',
      author: 'Jennifer Park',
      assigned_team: 'Mobile Team',
      affected_customers: 800,
      changelog_published: false,
      notification_sent: false,
      tags: ['Mobile', 'Offline', 'Sync'],
      related_tickets: ['SUPP-234']
    },
    {
      id: 'update-004',
      title: 'Export Performance Bug Fix',
      description: 'Resolved memory leak causing export timeouts for large datasets. Export speed improved by 65%.',
      jira_story_key: 'PLAT-298',
      type: 'bug_fix',
      status: 'published',
      priority: 'high',
      impact_level: 'medium',
      release_version: 'v2.4.0',
      completion_date: '2024-01-12T16:45:00Z',
      published_at: '2024-01-13T10:00:00Z',
      author: 'Alex Thompson',
      assigned_team: 'Backend Team',
      affected_customers: 450,
      changelog_published: true,
      notification_sent: true,
      tags: ['Export', 'Performance', 'Bug Fix'],
      customer_feedback_score: 4.2,
      related_tickets: ['SUPP-167', 'SUPP-178', 'SUPP-191']
    }
  ];

  // Enhanced changelog entries following TextMagic patterns
  const mockChangelogEntries: EnhancedChangelogEntry[] = [
    {
      id: 'changelog-v2.4.2',
      version: 'v2.4.2',
      release_date: '2024-01-20T00:00:00Z',
      category: 'Added',
      customer_facing_title: 'Real-time Analytics Dashboard',
      customer_facing_description: 'Introducing our new analytics dashboard with live data updates, customizable widgets, and advanced filtering capabilities.',
      highlights: [
        'Live data streaming for real-time insights',
        'Drag-and-drop dashboard customization',
        'Advanced filtering and date range selection',
        'Export analytics to PDF and CSV formats',
        '40% faster data loading performance'
      ],
      breaking_changes: false,
      view_count: 1247,
      upvotes: 89,
      feedback_count: 23,
      jira_story_key: 'PLAT-245',
      approval_status: 'published',
      public_visibility: true
    },
    {
      id: 'changelog-v2.4.1',
      version: 'v2.4.1',
      release_date: '2024-01-15T00:00:00Z',
      category: 'Security',
      customer_facing_title: 'Enhanced Security & Multi-Factor Authentication',
      customer_facing_description: 'We\'ve strengthened our security infrastructure with multi-factor authentication, improved session management, and advanced threat detection.',
      highlights: [
        'Multi-factor authentication now available for all users',
        'Enhanced session security with automatic timeout',
        'Real-time threat detection and alerts',
        'Improved password strength requirements',
        'Security audit logs for enterprise customers'
      ],
      breaking_changes: true,
      migration_notes: 'All users will be prompted to set up MFA on their next login. API users need to update authentication headers.',
      view_count: 2156,
      upvotes: 156,
      feedback_count: 45,
      jira_story_key: 'PLAT-267',
      approval_status: 'published',
      public_visibility: true
    },
    {
      id: 'changelog-v2.4.0',
      version: 'v2.4.0',
      release_date: '2024-01-10T00:00:00Z',
      category: 'Fixed',
      customer_facing_title: 'Export Performance Improvements',
      customer_facing_description: 'Resolved critical performance issues with data exports and significantly improved processing speeds for large datasets.',
      highlights: [
        'Export speed increased by 65% for large datasets',
        'Fixed memory leak causing export timeouts',
        'Better error handling and progress indicators',
        'Support for exporting up to 1M records',
        'Automatic retry mechanism for failed exports'
      ],
      breaking_changes: false,
      view_count: 892,
      upvotes: 67,
      feedback_count: 18,
      jira_story_key: 'PLAT-298',
      approval_status: 'published',
      public_visibility: true
    },
    {
      id: 'changelog-pending-001',
      version: 'v2.5.0',
      release_date: '2024-01-25T00:00:00Z',
      category: 'Added',
      customer_facing_title: 'Mobile App Offline Mode',
      customer_facing_description: 'Users can now access critical features and view cached data when offline, syncing automatically when connection is restored.',
      highlights: [
        'Full offline functionality for core features',
        'Automatic background sync when online',
        'Cached data storage up to 30 days',
        'Offline data visualization and reports',
        'Smart conflict resolution for data sync'
      ],
      breaking_changes: false,
      view_count: 0,
      upvotes: 0,
      feedback_count: 0,
      jira_story_key: 'PLAT-189',
      approval_status: 'pending',
      public_visibility: false
    }
  ];

  useEffect(() => {
    // Check for tab parameter in URL
    const tabParam = searchParams.get('tab');
    console.log('🔍 URL tab parameter detected:', tabParam);
    console.log('🔍 All search params:', searchParams.toString());
    
    if (tabParam === 'approval' || tabParam === 'changelog') {
      console.log('✅ Setting active tab to:', tabParam);
      setActiveTab(tabParam);
    }
    
    fetchChangelogData();
  }, [searchParams]);
  
  // Additional client-side URL check as fallback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      console.log('🌐 Client-side URL check - tab parameter:', tabParam);
      
      if (tabParam === 'approval' || tabParam === 'changelog') {
        console.log('🌐 Client-side setting active tab to:', tabParam);
        setActiveTab(tabParam);
      }
    }
  }, []);

  const fetchChangelogData = async () => {
    setLoading(true);
    try {
      // Fetch all changelog entries
      const response = await fetch('/api/changelog?status=all&limit=100');
      const data = await response.json();
      
      if (data.success) {
        console.log('🔍 Raw API data entries:', data.entries.length);
        console.log('🔍 First few entries metadata:', data.entries.slice(0, 3).map((e: any) => ({
          id: e.id,
          title: e.content_title,
          needs_approval: e.metadata?.needs_approval,
          metadata: e.metadata
        })));
        
        // Transform API data to match component interface
        const transformedEntries = data.entries.map((entry: any) => ({
          id: entry.id,
          version: entry.version || 'TBD',
          release_date: entry.release_date || entry.created_at,
          category: capitalizeCategory(entry.update_category),
          customer_facing_title: entry.content_title,
          customer_facing_description: entry.generated_content,
          highlights: entry.tldr_bullet_points || [],
          breaking_changes: entry.breaking_changes || false,
          migration_notes: entry.migration_notes,
          view_count: entry.view_count || 0,
          upvotes: entry.upvotes || 0,
          feedback_count: entry.feedback_count || 0,
          jira_story_key: entry.metadata?.jira_story_key,
          approval_status: entry.approval_status,
          public_visibility: entry.is_public && entry.public_changelog_visible,
          layout_template: entry.layout_template || 'standard',
          related_stories: entry.related_stories || [], // Add related stories from API
          metadata: entry.metadata // Preserve metadata for approval filtering
        }));
        
        console.log('🔍 Transformed entries:', transformedEntries.length);
        console.log('🔍 Entries with needs_approval:', transformedEntries.filter((e: any) => e.metadata?.needs_approval).length);
        console.log('🔍 Sample transformed entries:', transformedEntries.slice(0, 3).map((e: any) => ({
          id: e.id,
          title: e.customer_facing_title,
          needs_approval: e.metadata?.needs_approval,
          metadata: e.metadata
        })));
        
        setChangelogEntries(transformedEntries);
      } else {
        console.error('Failed to fetch changelog data:', data.error);
        // Fallback to mock data
        setChangelogEntries(mockChangelogEntries);
      }
    } catch (error) {
      console.error('Error fetching changelog data:', error);
      // Fallback to mock data
      setChangelogEntries(mockChangelogEntries);
    } finally {
      setLoading(false);
    }
  };

  const capitalizeCategory = (category: string): 'Added' | 'Fixed' | 'Improved' | 'Deprecated' | 'Security' => {
    const capitalized = category?.charAt(0).toUpperCase() + category?.slice(1).toLowerCase();
    
    switch (capitalized?.toLowerCase()) {
      case 'added':
      case 'new':
      case 'feature':
        return 'Added';
      case 'fixed':
      case 'bug':
      case 'bugfix':
        return 'Fixed';
      case 'improved':
      case 'enhancement':
      case 'update':
        return 'Improved';
      case 'deprecated':
      case 'removal':
        return 'Deprecated';
      case 'security':
      case 'auth':
        return 'Security';
      default:
        return 'Improved';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'new_feature': return 'calendly-badge-success';
      case 'feature_enhancement': return 'calendly-badge-info';
      case 'bug_fix': return 'calendly-badge-warning';
      case 'performance_improvement': return 'calendly-badge-info';
      case 'security_update': return 'calendly-badge-danger';
      default: return 'calendly-badge-info';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'calendly-badge-info';
      case 'development': return 'calendly-badge-warning';
      case 'testing': return 'calendly-badge-warning';
      case 'deployed': return 'calendly-badge-success';
      case 'published': return 'calendly-badge-success';
      default: return 'calendly-badge-info';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'calendly-badge-danger';
      case 'high': return 'calendly-badge-warning';
      case 'medium': return 'calendly-badge-info';
      case 'low': return 'calendly-badge-success';
      default: return 'calendly-badge-info';
    }
  };

  const getJiraPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'highest': 
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      case 'lowest': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    if (!timestamp) return 'Unknown time';
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_feature': return Zap;
      case 'feature_enhancement': return Lightbulb;
      case 'bug_fix': return Bug;
      case 'performance_improvement': return TrendingUp;
      case 'security_update': return Settings;
      default: return Package;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Added': return 'calendly-badge-success';
      case 'Improved': return 'calendly-badge-info';
      case 'Fixed': return 'calendly-badge-warning';
      case 'Security': return 'calendly-badge-danger';
      case 'Deprecated': return 'bg-orange-100 text-orange-800';
      default: return 'calendly-badge-info';
    }
  };


  const filteredUpdates = productUpdates.filter(update => {
    const matchesSearch = !searchQuery || 
      update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.jira_story_key.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || update.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || update.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || update.priority === priorityFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const filteredChangelog = changelogEntries.filter(entry => {
    // Only show approved and published entries in Changelog Management tab
    const isApproved = entry.approval_status === 'approved' || entry.approval_status === 'published';
    
    const matchesSearch = !searchQuery || 
      entry.customer_facing_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.customer_facing_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.version.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesVersion = versionFilter === 'all' || entry.version === versionFilter;
    const matchesType = changelogTypeFilter === 'all' || entry.category === changelogTypeFilter;
    
    return isApproved && matchesSearch && matchesVersion && matchesType;
  });

  const handleUpdateClick = (updateId: string) => {
    console.log('View update:', updateId);
  };

  const handleChangelogClick = (entryId: string) => {
    console.log('View changelog:', entryId);
  };

  const handleEditEntry = (entry: EnhancedChangelogEntry) => {
    setEditingEntryId(entry.id);
    setEditForm({
      customer_facing_title: entry.customer_facing_title,
      customer_facing_description: entry.customer_facing_description,
      highlights: [...entry.highlights],
      category: entry.category,
      breaking_changes: entry.breaking_changes,
      migration_notes: entry.migration_notes,
      layout_template: entry.layout_template || 'standard',
      external_link: entry.external_link || '',
      video_url: entry.video_url || '',
      image_url: entry.image_url || '',
      related_stories: entry.related_stories || []
    });
  };

  const handleSaveEdit = async () => {
    if (!editingEntryId) return;
    
    try {
      console.log('🔧 [SAVE START] Saving edit form data:', editForm);
      console.log('🔧 [SAVE START] Entry ID:', editingEntryId);
      console.log('🔧 [SAVE START] Timestamp:', new Date().toISOString());
      
      // Check if we can find the entry being edited
      const entryBeingEdited = changelogEntries.find(e => e.id === editingEntryId);
      console.log('🔧 [SAVE START] Found entry being edited:', !!entryBeingEdited);
      if (entryBeingEdited) {
        console.log('🔧 [SAVE START] Entry title:', entryBeingEdited.content_title);
      }
      
      console.log('🔧 [SAVE API] Making PUT request...');
      const response = await fetch(`/api/changelog?id=${editingEntryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });
      
      console.log('🔧 [SAVE API] Response received - Status:', response.status);
      console.log('🔧 [SAVE API] Response OK:', response.ok);
      console.log('🔧 [SAVE API] Response headers:', response.headers.get('content-type'));
      
      const data = await response.json();
      console.log('🔧 [SAVE API] Data parsed successfully');
      console.log('🔧 [SAVE API] Data keys:', Object.keys(data));
      console.log('🔧 [SAVE API] data.success:', data.success, typeof data.success);
      
      if (data.success) {
        console.log('✅ [SAVE SUCCESS] Save successful, updating state...');
        
        // Refresh the data to get the updated entry from the server
        console.log('🔄 [REFRESH] Starting data refresh...');
        await fetchChangelogData();
        console.log('✅ [REFRESH] Data refreshed successfully');
        
        // Send Slack notification if approval status changed
        if (editForm.approval_status === 'approved') {
          console.log('📢 [SLACK] Sending approval notification...');
          await sendSlackNotification({
            action: 'approval_request',
            contentId: editingEntryId,
            contentTitle: editForm.customer_facing_title || 'Untitled Entry',
            contentType: 'changelog_entry',
            contentSummary: editForm.customer_facing_description?.substring(0, 150) + '...' || 'No description available',
            qualityScore: 85, // You can calculate this based on your quality metrics
            jiraKey: editForm.jira_story_key || 'N/A',
            assignee: 'Team', // You can get this from JIRA metadata
            category: editForm.category || 'feature_update'
          });
          console.log('✅ [SLACK] Notification sent');
        }
        
        console.log('✅ [SAVE COMPLETE] Successfully saved changes for entry:', editingEntryId);
      } else {
        console.error('❌ [SAVE ERROR] Failed to save changes:', data.error || data);
        console.error('❌ [SAVE ERROR] Response status:', response.status);
        console.error('❌ [SAVE ERROR] Full response data:', data);
        alert(`Failed to save changes: ${data.error || 'Unknown error'}. Please try again.`);
      }
    } catch (error) {
      console.error('❌ [SAVE EXCEPTION] Error saving changes:', error);
      console.error('❌ [SAVE EXCEPTION] Error name:', error.name);
      console.error('❌ [SAVE EXCEPTION] Error message:', error.message);
      console.error('❌ [SAVE EXCEPTION] Error stack:', error.stack);
      alert(`Failed to save changes: ${error.message}. Please try again.`);
    }
    
    // Reset editing state
    console.log('🧹 [SAVE CLEANUP] Resetting editing state...');
    setEditingEntryId(null);
    setEditForm({});
    console.log('🧹 [SAVE CLEANUP] State reset complete');
  };

  const sendSlackNotification = async (notificationData: any) => {
    try {
      const response = await fetch('/api/slack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });
      
      if (response.ok) {
        console.log('Slack notification sent successfully');
      } else {
        console.warn('Failed to send Slack notification');
      }
    } catch (error) {
      console.warn('Error sending Slack notification:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
    setEditForm({});
  };

  const updateEditForm = (field: string, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleVisibility = async (entryId: string) => {
    const entry = changelogEntries.find(e => e.id === entryId);
    if (!entry) return;
    
    try {
      const response = await fetch(`/api/changelog?id=${entryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_visibility: !entry.public_visibility
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setChangelogEntries(prev => prev.map(entry => 
          entry.id === entryId 
            ? { ...entry, public_visibility: !entry.public_visibility }
            : entry
        ));
        console.log('Successfully toggled visibility for entry:', entryId);
      } else {
        console.error('Failed to toggle visibility:', data.error);
        alert('Failed to update visibility. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Failed to update visibility. Please try again.');
    }
  };

  const handleToggleApprovalVisibility = async (entryId: string) => {
    // Temporarily disabled - API doesn't support approval status updates yet
    console.log('Approval visibility toggle temporarily disabled');
    alert('This feature is temporarily disabled while we improve the approval system.');
    return;
  };

  const handleApproveEntry = async (entryId: string, makePublic: boolean = true) => {
    try {
      console.log(`Approving entry ${entryId} with public visibility: ${makePublic}`);
      
      const response = await fetch(`/api/changelog?id=${entryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approval_status: 'approved',
          public_visibility: makePublic,
          release_date: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve entry');
      }

      const result = await response.json();
      console.log('Entry approved successfully:', result);

      // Refresh the changelog data
      await fetchChangelogData();
      
      alert('Changelog entry approved and published successfully! The JIRA ticket has been updated with the TLDR.');
    } catch (error) {
      console.error('Error approving entry:', error);
      alert('Failed to approve entry. Please try again.');
    }
  };

  const handleRejectEntry = async (entryId: string) => {
    try {
      if (!confirm('Are you sure you want to reject this changelog entry? It will be hidden from the approval queue.')) {
        return;
      }

      console.log(`Rejecting entry ${entryId}`);
      
      // For now, we'll just hide it from approval queue
      // In the future, this could set a "rejected" status
      const response = await fetch(`/api/changelog?id=${entryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approval_status: 'rejected',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject entry');
      }

      // Refresh the changelog data
      await fetchChangelogData();
      
      alert('Changelog entry rejected and removed from approval queue.');
    } catch (error) {
      console.error('Error rejecting entry:', error);
      alert('Failed to reject entry. Please try again.');
    }
  };

  const handleRegenerateContent = async () => {
    if (!editingEntryId) return;
    
    try {
      console.log('🔄 Regenerating content with related stories...');
      
      // Get the related stories from the edit form
      const relatedStories = editForm.related_stories?.filter(story => story && story.trim()) || [];
      
      if (relatedStories.length === 0) {
        alert('Please add at least one related JIRA story to regenerate content.');
        return;
      }
      
      // Show loading state
      const button = document.activeElement as HTMLButtonElement;
      const originalText = button?.textContent || '';
      if (button) {
        button.textContent = 'Regenerating...';
        button.disabled = true;
      }
      
      // Call the regeneration API
      const response = await fetch('/api/regenerate-changelog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryId: editingEntryId,
          relatedStories: relatedStories
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Content regenerated successfully');
        
        // Update the edit form with the enhanced content
        const enhancedContent = data.enhancedContent;
        setEditForm(prev => ({
          ...prev,
          customer_facing_title: enhancedContent.customer_facing_title,
          customer_facing_description: enhancedContent.customer_facing_description,
          highlights: enhancedContent.highlights,
          category: enhancedContent.category,
          breaking_changes: enhancedContent.breaking_changes,
          migration_notes: enhancedContent.migration_notes || prev.migration_notes
        }));
        
        // Show detailed success message
        let successMessage = `✅ Content regenerated successfully with context from ${data.relatedStoriesProcessed} related stories!`;
        
        if (data.failedStories && data.failedStories.length > 0) {
          successMessage += `\n\n⚠️ Note: Could not access ${data.failedStories.length} stories (${data.failedStories.join(', ')}). This may be due to permissions or the stories not existing.`;
        }
        
        alert(successMessage);
        
      } else {
        console.error('❌ Regeneration failed:', data.error);
        
        // Provide detailed error feedback
        let errorMessage = `Failed to regenerate content: ${data.error}`;
        
        if (data.details) {
          errorMessage += `\n\nDetails: ${data.details}`;
        }
        
        if (data.failedStories && data.failedStories.length > 0) {
          errorMessage += `\n\nFailed stories: ${data.failedStories.join(', ')}`;
        }
        
        // Check for authentication issues
        if (data.error.includes('Could not fetch any of the related stories from JIRA')) {
          errorMessage += '\n\n💡 Tip: This may be due to JIRA authentication issues or story access permissions. Please verify your JIRA credentials and story keys.';
        }
        
        alert(errorMessage);
      }
      
      // Restore button state after both success and error
      if (button) {
        button.textContent = originalText;
        button.disabled = false;
      }
      
    } catch (error) {
      console.error('❌ Error regenerating content:', error);
      alert('Failed to regenerate content. Please check your network connection and try again.');
      
      // Restore button state on network/other errors
      if (button) {
        button.textContent = originalText;
        button.disabled = false;
      }
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
                <p className="calendly-body mt-4">Loading product data...</p>
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
              <h1 className="calendly-h1">Product Changelog</h1>
              <p className="calendly-body">Manage published changelog entries, review pending updates, and track customer engagement</p>
            </div>
          </div>

          {/* Changelog-Focused Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4" style={{ marginBottom: '24px' }}>
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Published Entries</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>
                    {changelogEntries.filter(e => e.approval_status === 'approved' || e.approval_status === 'published').length}
                  </p>
                </div>
                <GitBranch className="w-8 h-8" style={{ color: '#10b981' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Pending Review</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>
                    {changelogEntries.filter(e => e.approval_status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-8 h-8" style={{ color: '#f59e0b' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Total Views</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>
                    {changelogEntries
                      .filter(e => e.approval_status === 'approved' || e.approval_status === 'published')
                      .reduce((sum, e) => sum + e.view_count, 0).toLocaleString()}
                  </p>
                </div>
                <Eye className="w-8 h-8" style={{ color: '#4285f4' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Total Upvotes</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>
                    {changelogEntries
                      .filter(e => e.approval_status === 'approved' || e.approval_status === 'published')
                      .reduce((sum, e) => sum + e.upvotes, 0)}
                  </p>
                </div>
                <Star className="w-8 h-8" style={{ color: '#6366f1' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Avg. Engagement</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>
                    {(() => {
                      const approvedEntries = changelogEntries.filter(e => e.approval_status === 'approved' || e.approval_status === 'published');
                      return approvedEntries.length > 0 
                        ? (approvedEntries.reduce((sum, e) => sum + e.upvotes, 0) / approvedEntries.length).toFixed(1)
                        : '0';
                    })()}
                  </p>
                </div>
                <Activity className="w-8 h-8" style={{ color: '#8b5cf6' }} />
              </div>
            </div>
          </div>


          {/* Tab Navigation - Changelog First */}
          <div className="calendly-card" style={{ marginBottom: '24px', padding: 0 }}>
            <div className="flex border-b" style={{ borderColor: '#e2e8f0' }}>
              <button
                onClick={() => setActiveTab('changelog')}
                className="py-4 px-6 border-b-2 calendly-body-sm font-medium transition-colors relative"
                style={activeTab === 'changelog' ? {
                  borderBottomColor: '#4285f4',
                  color: '#4285f4'
                } : {
                  borderBottomColor: 'transparent',
                  color: '#718096'
                }}
              >
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-4 h-4" />
                  <span>Published Changelog</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('approval')}
                className="py-4 px-6 border-b-2 calendly-body-sm font-medium transition-colors relative"
                style={activeTab === 'approval' ? {
                  borderBottomColor: '#4285f4',
                  color: '#4285f4'
                } : {
                  borderBottomColor: 'transparent',
                  color: '#718096'
                }}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Approval Dashboard</span>
                  {changelogEntries.filter(entry => entry.approval_status === 'pending').length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {changelogEntries.filter(entry => entry.approval_status === 'pending').length}
                    </span>
                  )}
                </div>
              </button>
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
                    placeholder={activeTab === 'updates' ? "Search updates, JIRA keys, or descriptions..." : "Search changelog entries or versions..."}
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
                {activeTab === 'updates' ? (
                  <>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                      style={{ border: '1px solid #e2e8f0', background: 'white' }}
                    >
                      <option value="all">All Types</option>
                      <option value="new_feature">New Feature</option>
                      <option value="feature_enhancement">Enhancement</option>
                      <option value="bug_fix">Bug Fix</option>
                      <option value="performance_improvement">Performance</option>
                      <option value="security_update">Security</option>
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                      style={{ border: '1px solid #e2e8f0', background: 'white' }}
                    >
                      <option value="all">All Status</option>
                      <option value="planning">Planning</option>
                      <option value="testing">Testing</option>
                      <option value="deployed">Deployed</option>
                      <option value="published">Published</option>
                    </select>

                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                      style={{ border: '1px solid #e2e8f0', background: 'white' }}
                    >
                      <option value="all">All Priorities</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </>
                ) : (
                  <>
                    <select
                      value={changelogTypeFilter}
                      onChange={(e) => setChangelogTypeFilter(e.target.value)}
                      className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                      style={{ border: '1px solid #e2e8f0', background: 'white' }}
                    >
                      <option value="all">All Categories</option>
                      <option value="Added">Added</option>
                      <option value="Improved">Improved</option>
                      <option value="Fixed">Fixed</option>
                      <option value="Security">Security</option>
                      <option value="Deprecated">Deprecated</option>
                    </select>
                  </>
                )}

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

          {/* Content Display */}
          {activeTab === 'changelog' ? (
            <div className="space-y-6">
              {/* Enhanced Changelog Display */}
              {filteredChangelog.map((entry) => (
                <div
                  key={entry.id}
                  className="calendly-card transition-all duration-200"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)';
                  }}
                >
                  {editingEntryId === entry.id ? (
                    <>
                      {/* Edit Mode */}
                      {/* Edit Header */}
                      <div className="flex items-start justify-between" style={{ marginBottom: '16px' }}>
                        <div className="flex items-center space-x-3 flex-1">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            (editForm.category || entry.category) === 'Added' ? 'bg-green-100 text-green-800' :
                            (editForm.category || entry.category) === 'Fixed' ? 'bg-blue-100 text-blue-800' :
                            (editForm.category || entry.category) === 'Security' ? 'bg-red-100 text-red-800' :
                            (editForm.category || entry.category) === 'Improved' ? 'bg-purple-100 text-purple-800' :
                            (editForm.category || entry.category) === 'Deprecated' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {editForm.category || entry.category}
                          </span>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={editForm.customer_facing_title || ''}
                              onChange={(e) => updateEditForm('customer_facing_title', e.target.value)}
                              className="calendly-h3 w-full border-0 border-b-2 border-blue-300 bg-transparent focus:outline-none focus:border-blue-500"
                              style={{ marginBottom: '4px' }}
                              placeholder="Entry title..."
                            />
                            <p className="calendly-label-sm">
                              {formatDistanceToNow(new Date(entry.release_date), { addSuffix: true })}
                              {entry.jira_story_key && (
                                <span className="ml-2 text-blue-600">• {entry.jira_story_key}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <select
                            value={editForm.category || entry.category}
                            onChange={(e) => updateEditForm('category', e.target.value)}
                            className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            style={{ background: 'white' }}
                          >
                            <option value="Added">Added</option>
                            <option value="Improved">Improved</option>
                            <option value="Fixed">Fixed</option>
                            <option value="Security">Security</option>
                            <option value="Deprecated">Deprecated</option>
                          </select>
                        </div>
                      </div>

                      {/* Layout Template Selector */}
                      <div style={{ marginBottom: '16px' }}>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Changelog Layout Template
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div 
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                              (editForm.layout_template || 'standard') === 'standard' 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => updateEditForm('layout_template', 'standard')}
                          >
                            <div className="text-sm font-medium mb-1">Standard</div>
                            <div className="text-xs text-gray-600">Title + Description + Bullet highlights</div>
                          </div>
                          
                          <div 
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                              (editForm.layout_template || 'standard') === 'feature_spotlight' 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => updateEditForm('layout_template', 'feature_spotlight')}
                          >
                            <div className="text-sm font-medium mb-1">Feature Spotlight</div>
                            <div className="text-xs text-gray-600">Hero layout with key benefits & demo</div>
                          </div>
                          
                          <div 
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                              (editForm.layout_template || 'standard') === 'technical_update' 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => updateEditForm('layout_template', 'technical_update')}
                          >
                            <div className="text-sm font-medium mb-1">⚙️ Technical Update</div>
                            <div className="text-xs text-gray-600">Structured with before/after & impact</div>
                          </div>
                          
                          <div 
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                              (editForm.layout_template || 'standard') === 'security_notice' 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => updateEditForm('layout_template', 'security_notice')}
                          >
                            <div className="text-sm font-medium mb-1">Security Notice</div>
                            <div className="text-xs text-gray-600">Prominent alert with action items</div>
                          </div>
                          
                          <div 
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                              (editForm.layout_template || 'standard') === 'deprecation_warning' 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => updateEditForm('layout_template', 'deprecation_warning')}
                          >
                            <div className="text-sm font-medium mb-1">Deprecation</div>
                            <div className="text-xs text-gray-600">Timeline + migration guide layout</div>
                          </div>
                          
                          <div 
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                              (editForm.layout_template || 'standard') === 'minimal' 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => updateEditForm('layout_template', 'minimal')}
                          >
                            <div className="text-sm font-medium mb-1">Minimal</div>
                            <div className="text-xs text-gray-600">Clean, simple single-paragraph style</div>
                          </div>
                        </div>
                        
                        {/* Template Preview */}
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                          <div className="text-xs font-medium text-gray-700 mb-2">Preview Layout:</div>
                          <div className="text-xs text-gray-600">
                            {(() => {
                              switch (editForm.layout_template || 'standard') {
                                case 'feature_spotlight':
                                  return 'Large title → Hero description → Key benefits grid → Call-to-action';
                                case 'technical_update':
                                  return 'Title → Problem/Solution sections → Technical details → Impact metrics';
                                case 'security_notice':
                                  return 'Alert banner → Security summary → Action required → Additional resources';
                                case 'deprecation_warning':
                                  return 'Warning banner → Timeline → Migration steps → Support resources';
                                case 'minimal':
                                  return 'Simple title → Single paragraph → Optional link';
                                default:
                                  return 'Standard title → Description paragraph → Bulleted highlights list';
                              }
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Fields Based on Template */}
                      {(() => {
                        const template = editForm.layout_template || 'standard';
                        
                        switch (template) {
                          case 'feature_spotlight':
                            return (
                              <>
                                <div style={{ marginBottom: '12px' }}>
                                  <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Hero Description
                                  </label>
                                  <textarea
                                    value={editForm.customer_facing_description || ''}
                                    onChange={(e) => updateEditForm('customer_facing_description', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 calendly-body-sm transition-all duration-200"
                                    style={{ minHeight: '80px', background: 'white' }}
                                    placeholder="Write a compelling description that highlights the main benefit of this feature..."
                                  />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                  <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Call-to-Action Text
                                  </label>
                                  <input
                                    type="text"
                                    value={editForm.cta_text || ''}
                                    onChange={(e) => updateEditForm('cta_text', e.target.value)}
                                    className="w-full px-3 py-2 calendly-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    style={{ background: 'white' }}
                                    placeholder="e.g., Try the new feature, Learn more, Get started"
                                  />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                  <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Call-to-Action Link
                                  </label>
                                  <input
                                    type="url"
                                    value={editForm.cta_link || ''}
                                    onChange={(e) => updateEditForm('cta_link', e.target.value)}
                                    className="w-full px-3 py-2 calendly-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    style={{ background: 'white' }}
                                    placeholder="https://..."
                                  />
                                </div>
                              </>
                            );
                            
                          case 'technical_update':
                            return (
                              <>
                                <div style={{ marginBottom: '12px' }}>
                                  <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Problem Statement
                                  </label>
                                  <textarea
                                    value={editForm.problem_statement || ''}
                                    onChange={(e) => updateEditForm('problem_statement', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 calendly-body-sm transition-all duration-200"
                                    style={{ minHeight: '60px', background: 'white' }}
                                    placeholder="What issue or limitation did this update address?"
                                  />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                  <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Solution Description
                                  </label>
                                  <textarea
                                    value={editForm.customer_facing_description || ''}
                                    onChange={(e) => updateEditForm('customer_facing_description', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 calendly-body-sm transition-all duration-200"
                                    style={{ minHeight: '60px', background: 'white' }}
                                    placeholder="How does this update solve the problem?"
                                  />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                  <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Impact Metrics
                                  </label>
                                  <input
                                    type="text"
                                    value={editForm.impact_metrics || ''}
                                    onChange={(e) => updateEditForm('impact_metrics', e.target.value)}
                                    className="w-full px-3 py-2 calendly-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    style={{ background: 'white' }}
                                    placeholder="e.g., 40% faster, 99.9% uptime, Reduced by 2 clicks"
                                  />
                                </div>
                              </>
                            );
                            
                          case 'security_notice':
                            return (
                              <>
                                <div style={{ marginBottom: '12px' }}>
                                  <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Security Summary
                                  </label>
                                  <textarea
                                    value={editForm.customer_facing_description || ''}
                                    onChange={(e) => updateEditForm('customer_facing_description', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 calendly-body-sm transition-all duration-200"
                                    style={{ minHeight: '60px', background: 'white' }}
                                    placeholder="Describe the security improvement or fix..."
                                  />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                  <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Action Required
                                  </label>
                                  <textarea
                                    value={editForm.action_required || ''}
                                    onChange={(e) => updateEditForm('action_required', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 calendly-body-sm transition-all duration-200"
                                    style={{ minHeight: '60px', background: 'white' }}
                                    placeholder="What do users need to do? Leave empty if no action required."
                                  />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                  <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Additional Resources
                                  </label>
                                  <input
                                    type="text"
                                    value={editForm.resource_links || ''}
                                    onChange={(e) => updateEditForm('resource_links', e.target.value)}
                                    className="w-full px-3 py-2 calendly-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    style={{ background: 'white' }}
                                    placeholder="Links to documentation, guides, or support (comma-separated)"
                                  />
                                </div>
                              </>
                            );
                            
                          case 'deprecation_warning':
                            return (
                              <>
                                <div style={{ marginBottom: '12px' }}>
                                  <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Deprecation Notice
                                  </label>
                                  <textarea
                                    value={editForm.customer_facing_description || ''}
                                    onChange={(e) => updateEditForm('customer_facing_description', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 calendly-body-sm transition-all duration-200"
                                    style={{ minHeight: '60px', background: 'white' }}
                                    placeholder="Explain what's being deprecated and why..."
                                  />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                  <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Timeline
                                  </label>
                                  <input
                                    type="text"
                                    value={editForm.deprecation_timeline || ''}
                                    onChange={(e) => updateEditForm('deprecation_timeline', e.target.value)}
                                    className="w-full px-3 py-2 calendly-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    style={{ background: 'white' }}
                                    placeholder="e.g., End of support: March 2024, Removal: June 2024"
                                  />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                  <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Recommended Alternative
                                  </label>
                                  <input
                                    type="text"
                                    value={editForm.recommended_alternative || ''}
                                    onChange={(e) => updateEditForm('recommended_alternative', e.target.value)}
                                    className="w-full px-3 py-2 calendly-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    style={{ background: 'white' }}
                                    placeholder="What should users use instead?"
                                  />
                                </div>
                              </>
                            );
                            
                          case 'minimal':
                            return (
                              <>
                                <div style={{ marginBottom: '12px' }}>
                                  <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Brief Description
                                  </label>
                                  <textarea
                                    value={editForm.customer_facing_description || ''}
                                    onChange={(e) => updateEditForm('customer_facing_description', e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 calendly-body-sm transition-all duration-200"
                                    style={{ minHeight: '60px', background: 'white' }}
                                    placeholder="A concise, single-paragraph description of the change..."
                                  />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                  <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Optional Link
                                  </label>
                                  <input
                                    type="url"
                                    value={editForm.optional_link || ''}
                                    onChange={(e) => updateEditForm('optional_link', e.target.value)}
                                    className="w-full px-3 py-2 calendly-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    style={{ background: 'white' }}
                                    placeholder="https://... (optional)"
                                  />
                                </div>
                              </>
                            );
                            
                          default: // standard
                            return (
                              <div style={{ marginBottom: '12px' }}>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                  Customer-Facing Description
                                </label>
                                <textarea
                                  value={editForm.customer_facing_description || ''}
                                  onChange={(e) => updateEditForm('customer_facing_description', e.target.value)}
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 calendly-body-sm transition-all duration-200"
                                  style={{ minHeight: '80px', background: 'white' }}
                                  placeholder="Describe what changed and how it benefits customers..."
                                />
                              </div>
                            );
                        }
                      })()}

                    </>
                  ) : (
                    <>
                      {/* View Mode */}
                      {/* Changelog Header */}
                      <div className="flex items-start justify-between" style={{ marginBottom: '16px' }}>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            entry.category === 'Added' ? 'bg-green-100 text-green-800' :
                            entry.category === 'Fixed' ? 'bg-blue-100 text-blue-800' :
                            entry.category === 'Security' ? 'bg-red-100 text-red-800' :
                            entry.category === 'Improved' ? 'bg-purple-100 text-purple-800' :
                            entry.category === 'Deprecated' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.category}
                          </span>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="calendly-h3" style={{ marginBottom: 0 }}>{entry.customer_facing_title}</h3>
                              <span className="text-sm font-medium text-gray-500">{entry.version}</span>
                            </div>
                            <p className="calendly-label-sm">
                              {formatDistanceToNow(new Date(entry.release_date), { addSuffix: true })}
                              {entry.jira_story_key && (
                                <span className="ml-2 text-blue-600">• {entry.jira_story_key}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`calendly-badge ${getCategoryColor(entry.category)}`}>
                            {entry.category}
                          </span>
                          {!entry.public_visibility && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              Internal Only
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className="calendly-body-sm" style={{ marginBottom: '16px' }}>
                        {entry.customer_facing_description}
                      </p>
                    </>
                  )}


                  {/* Highlights - Conditional based on template */}
                  {(editingEntryId !== entry.id || !['minimal', 'deprecation_warning'].includes(editForm.layout_template || 'standard')) && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        {(() => {
                          const template = editingEntryId === entry.id ? (editForm.layout_template || 'standard') : 'standard';
                          switch (template) {
                            case 'feature_spotlight': return 'Key Benefits';
                            case 'technical_update': return 'Technical Details';
                            case 'security_notice': return 'Security Improvements';
                            default: return 'What\'s New';
                          }
                        })()}
                      </h4>
                      {editingEntryId === entry.id ? (
                      <div className="space-y-2">
                        {/* Edit Highlights */}
                        {(editForm.highlights || []).map((highlight, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <input
                              type="text"
                              value={highlight}
                              onChange={(e) => {
                                const newHighlights = [...(editForm.highlights || [])];
                                newHighlights[index] = e.target.value;
                                updateEditForm('highlights', newHighlights);
                              }}
                              className="flex-1 px-3 py-2 calendly-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              style={{ background: 'white' }}
                              placeholder="Highlight description..."
                            />
                            <button
                              onClick={() => {
                                const newHighlights = (editForm.highlights || []).filter((_, i) => i !== index);
                                updateEditForm('highlights', newHighlights);
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const newHighlights = [...(editForm.highlights || []), ''];
                              updateEditForm('highlights', newHighlights);
                            }}
                            className="px-3 py-2 text-blue-600 hover:text-blue-800 calendly-body-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            + Add Highlight
                          </button>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                const newHighlights = [...(editForm.highlights || []), e.target.value];
                                updateEditForm('highlights', newHighlights);
                                e.target.value = ''; // Reset selection
                              }
                            }}
                            className="px-3 py-2 calendly-body-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            style={{ background: 'white' }}
                          >
                            <option value="">+ Add from template</option>
                            <option value="Improved performance by [X]% faster loading times">Performance Improvement</option>
                            <option value="Enhanced user interface with better navigation">UI Enhancement</option>
                            <option value="Added support for [new integration/format]">New Integration</option>
                            <option value="Streamlined workflow reduces clicks by [X]">Workflow Improvement</option>
                            <option value="Better error handling and user feedback">Error Handling</option>
                            <option value="Mobile-responsive design improvements">Mobile Enhancement</option>
                            <option value="Advanced filtering and search capabilities">Search & Filter</option>
                            <option value="Automated [process] saves time and reduces errors">Automation</option>
                          </select>
                        </div>
                      </div>
                      ) : (
                        <ul className="space-y-1">
                          {/* View Highlights */}
                          {entry.highlights.map((highlight, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="calendly-body-sm">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Breaking Changes Toggle (Edit Mode Only) */}
                  {editingEntryId === entry.id && (
                    <div style={{ marginBottom: '16px' }}>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`breaking-changes-${entry.id}`}
                          checked={editForm.breaking_changes || false}
                          onChange={(e) => updateEditForm('breaking_changes', e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`breaking-changes-${entry.id}`} className="calendly-body-sm font-medium text-gray-900">
                          Breaking changes
                        </label>
                      </div>
                      
                      {/* Migration Notes (only if breaking changes checked) */}
                      {editForm.breaking_changes && (
                        <div style={{ marginTop: '12px' }}>
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            Migration Notes
                          </label>
                          <textarea
                            value={editForm.migration_notes || ''}
                            onChange={(e) => updateEditForm('migration_notes', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 calendly-body-sm transition-all duration-200"
                            style={{ minHeight: '60px', background: 'white' }}
                            placeholder="Provide migration instructions for users..."
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Related Stories (Edit Mode Only) */}
                  {editingEntryId === entry.id && (
                    <div style={{ marginBottom: '16px' }}>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Related JIRA Stories
                      </label>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {(editForm.related_stories || []).map((story, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {story}
                            <button
                              type="button"
                              onClick={() => {
                                const newStories = [...(editForm.related_stories || [])];
                                newStories.splice(index, 1);
                                updateEditForm('related_stories', newStories);
                              }}
                              className="ml-1.5 -mr-1 w-3 h-3 flex items-center justify-center rounded-full hover:bg-blue-200 transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          id={`new-story-${entry.id}`}
                          placeholder="Enter JIRA story key (e.g., PRESS-21463)"
                          className="flex-1 px-3 py-2 calendly-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          style={{ background: 'white' }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              const value = input.value.trim().toUpperCase();
                              if (value && !editForm.related_stories?.includes(value)) {
                                const newStories = [...(editForm.related_stories || []), value];
                                updateEditForm('related_stories', newStories);
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById(`new-story-${entry.id}`) as HTMLInputElement;
                            const value = input.value.trim().toUpperCase();
                            if (value && !editForm.related_stories?.includes(value)) {
                              const newStories = [...(editForm.related_stories || []), value];
                              updateEditForm('related_stories', newStories);
                              input.value = '';
                            }
                          }}
                          className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Breaking Changes */}
                  {entry.breaking_changes && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 className="text-sm font-medium text-red-900 mb-2 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>Breaking Changes</span>
                      </h4>
                      <div className="p-3 bg-red-50 rounded-md border border-red-200">
                        <span className="calendly-body-sm text-red-700">
                          Please review the migration notes below.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Migration Notes */}
                  {entry.migration_notes && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 className="text-sm font-medium text-orange-900 mb-2">Migration Notes</h4>
                      <div className="p-3 bg-orange-50 rounded-md border border-orange-200">
                        <span className="calendly-body-sm text-orange-800">{entry.migration_notes}</span>
                      </div>
                    </div>
                  )}

                  {/* Footer with Published Entry Actions */}
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" style={{ color: '#718096' }} />
                        <span className="calendly-label-sm">{entry.view_count} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4" style={{ color: '#718096' }} />
                        <span className="calendly-label-sm">{entry.upvotes} upvotes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" style={{ color: '#718096' }} />
                        <span className="calendly-label-sm">{entry.feedback_count} feedback</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {editingEntryId === entry.id ? (
                        <>
                          {/* Edit Mode Buttons */}
                          <button 
                            className="calendly-btn-primary"
                            onClick={handleSaveEdit}
                          >
                            Save Changes
                          </button>
                          <button 
                            className="calendly-btn-secondary"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {/* View Mode Buttons */}
                          <button 
                            className="calendly-btn-secondary"
                            onClick={() => handleEditEntry(entry)}
                          >
                            Edit Entry
                          </button>
                          {entry.public_visibility && (
                            <button 
                              className="calendly-btn-secondary flex items-center space-x-2"
                              onClick={() => {
                                window.open('/public-changelog', '_blank');
                              }}
                            >
                              <span>View Public</span>
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600">Public:</span>
                            <div className="flex items-center">
                              <button
                                onClick={() => handleToggleVisibility(entry.id)}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                  entry.public_visibility 
                                    ? 'bg-green-600' 
                                    : 'bg-gray-300'
                                }`}
                                title={entry.public_visibility ? 'Click to hide from public' : 'Click to show in public'}
                              >
                                <span
                                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                    entry.public_visibility ? 'translate-x-5' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              <span className="ml-2 text-xs text-gray-500">
                                {entry.public_visibility ? 'Visible' : 'Hidden'}
                              </span>
                            </div>
                          </div>
                          <button
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: '#718096' }}
                            onClick={() => {
                              console.log('View entry details:', entry.id);
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f1f5f9';
                              e.currentTarget.style.color = '#4285f4';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#718096';
                            }}
                          >
                            <ExternalLink className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : activeTab === 'approval' ? (
            <div className="space-y-6">
              {/* Approval Dashboard */}
              {/* Check if there are entries needing approval */}
              {changelogEntries.filter(entry => (entry as any).metadata?.needs_approval && !(entry as any).hidden_from_approval).length > 0 ? (
                <>
                  {/* Header with Stats */}
                  <div className="calendly-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="calendly-h3" style={{ marginBottom: '4px' }}>
                          Review & Approve ({changelogEntries.filter(entry => (entry as any).metadata?.needs_approval && !(entry as any).hidden_from_approval).length})
                        </h3>
                        <p className="calendly-body-sm text-gray-600">
                          Review changelog entries before publishing to customers
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="calendly-btn-secondary">
                          Approve All
                        </button>
                        <button className="calendly-btn-primary">
                          Bulk Actions
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Approval Cards */}
                  <div className="space-y-4">
                    {changelogEntries
                      .filter(entry => (entry as any).metadata?.needs_approval && !(entry as any).hidden_from_approval)
                      .map((entry) => (
                        <div key={entry.id} className="calendly-card hover:shadow-md transition-shadow duration-200">
                          {editingEntryId === entry.id ? (
                            <>
                              {/* Edit Mode */}
                              <div className="flex items-start justify-between" style={{ marginBottom: '16px' }}>
                                <div className="flex items-center space-x-3 flex-1">
                                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                    (editForm.category || entry.category) === 'Added' ? 'bg-green-100 text-green-800' :
                                    (editForm.category || entry.category) === 'Fixed' ? 'bg-blue-100 text-blue-800' :
                                    (editForm.category || entry.category) === 'Security' ? 'bg-red-100 text-red-800' :
                                    (editForm.category || entry.category) === 'Improved' ? 'bg-purple-100 text-purple-800' :
                                    (editForm.category || entry.category) === 'Deprecated' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {editForm.category || entry.category}
                                  </span>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      {/* JIRA Story Key (read-only in edit mode) */}
                                      {(entry as any).metadata?.jira_story_key && (
                                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                          {(entry as any).metadata.jira_story_key}
                                        </span>
                                      )}
                                      
                                      {/* Category Selector */}
                                      <select
                                        value={editForm.category || entry.category}
                                        onChange={(e) => updateEditForm('category', e.target.value)}
                                        className="px-2 py-1 text-xs border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      >
                                        <option value="Added">Added</option>
                                        <option value="Improved">Improved</option>
                                        <option value="Fixed">Fixed</option>
                                        <option value="Security">Security</option>
                                        <option value="Deprecated">Deprecated</option>
                                      </select>
                                    </div>
                                    
                                    {/* Title Editor */}
                                    <input
                                      type="text"
                                      value={editForm.customer_facing_title || entry.customer_facing_title}
                                      onChange={(e) => updateEditForm('customer_facing_title', e.target.value)}
                                      className="w-full text-lg font-semibold border-0 border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none bg-transparent"
                                      placeholder="Customer-facing title..."
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <button 
                                    className="calendly-btn-primary"
                                    onClick={handleSaveEdit}
                                  >
                                    Save Changes
                                  </button>
                                  <button 
                                    className="calendly-btn-secondary"
                                    onClick={handleCancelEdit}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>

                              {/* Description Editor */}
                              <div style={{ marginBottom: '16px' }}>
                                <textarea
                                  value={editForm.customer_facing_description || entry.customer_facing_description}
                                  onChange={(e) => updateEditForm('customer_facing_description', e.target.value)}
                                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 calendly-body-sm transition-all duration-200"
                                  style={{ minHeight: '80px' }}
                                  placeholder="Describe what this update means for customers..."
                                />
                              </div>

                              {/* Highlights Editor */}
                              <div style={{ marginBottom: '16px' }}>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Key Changes</h4>
                                <div className="space-y-2">
                                  {(editForm.highlights || entry.highlights || []).map((highlight, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                      <input
                                        type="text"
                                        value={highlight}
                                        onChange={(e) => {
                                          const newHighlights = [...(editForm.highlights || entry.highlights || [])];
                                          newHighlights[index] = e.target.value;
                                          updateEditForm('highlights', newHighlights);
                                        }}
                                        className="flex-1 px-3 py-2 calendly-body-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Highlight description..."
                                      />
                                      <button
                                        onClick={() => {
                                          const newHighlights = (editForm.highlights || entry.highlights || []).filter((_, i) => i !== index);
                                          updateEditForm('highlights', newHighlights);
                                        }}
                                        className="text-red-500 hover:text-red-700 p-1"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => {
                                      const newHighlights = [...(editForm.highlights || entry.highlights || []), ''];
                                      updateEditForm('highlights', newHighlights);
                                    }}
                                    className="px-3 py-2 text-blue-600 hover:text-blue-800 calendly-body-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
                                  >
                                    + Add Highlight
                                  </button>
                                </div>
                              </div>

                              {/* Optional Media Fields */}
                              <div style={{ marginBottom: '16px' }}>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Optional Media</h4>
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">External Link</label>
                                    <input
                                      type="url"
                                      value={editForm.external_link || ''}
                                      onChange={(e) => updateEditForm('external_link', e.target.value)}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="https://example.com/feature-demo"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Video URL</label>
                                    <input
                                      type="url"
                                      value={editForm.video_url || ''}
                                      onChange={(e) => updateEditForm('video_url', e.target.value)}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="https://youtube.com/watch?v=..."
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
                                    <input
                                      type="url"
                                      value={editForm.image_url || ''}
                                      onChange={(e) => updateEditForm('image_url', e.target.value)}
                                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder="https://example.com/screenshot.png"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Related Stories */}
                              <div style={{ marginBottom: '16px' }}>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Related JIRA Stories</h4>
                                <p className="text-xs text-gray-600 mb-3">
                                  Add related JIRA story keys to automatically include their context and regenerate the changelog content.
                                </p>
                                <div className="space-y-2">
                                  {(editForm.related_stories || []).map((storyKey, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                      <span className="text-xs text-gray-500 w-12">JIRA:</span>
                                      <input
                                        type="text"
                                        value={storyKey}
                                        onChange={(e) => {
                                          const newRelatedStories = [...(editForm.related_stories || [])];
                                          newRelatedStories[index] = e.target.value.toUpperCase();
                                          updateEditForm('related_stories', newRelatedStories);
                                        }}
                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="PRESS-12345"
                                        pattern="[A-Z]+-[0-9]+"
                                      />
                                      <button
                                        onClick={() => {
                                          const newRelatedStories = (editForm.related_stories || []).filter((_, i) => i !== index);
                                          updateEditForm('related_stories', newRelatedStories);
                                        }}
                                        className="text-red-500 hover:text-red-700 p-1 text-sm"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => {
                                        const newRelatedStories = [...(editForm.related_stories || []), ''];
                                        updateEditForm('related_stories', newRelatedStories);
                                      }}
                                      className="px-3 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                      + Add Related Story
                                    </button>
                                    {(editForm.related_stories || []).length > 0 && (
                                      <button
                                        onClick={handleRegenerateContent}
                                        className="calendly-btn-secondary"
                                      >
                                        Regenerate with Related Stories
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Breaking Changes Toggle */}
                              <div style={{ marginBottom: '16px' }}>
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="checkbox"
                                    id={`breaking-changes-${entry.id}`}
                                    checked={editForm.breaking_changes || false}
                                    onChange={(e) => updateEditForm('breaking_changes', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                  <label htmlFor={`breaking-changes-${entry.id}`} className="calendly-body-sm font-medium text-gray-900">
                                    Breaking changes
                                  </label>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* View Mode */}
                              <div className="flex items-start justify-between" style={{ marginBottom: '16px' }}>
                                <div className="flex items-center space-x-3">
                                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                    entry.category === 'Added' ? 'bg-green-100 text-green-800' :
                                    entry.category === 'Fixed' ? 'bg-blue-100 text-blue-800' :
                                    entry.category === 'Security' ? 'bg-red-100 text-red-800' :
                                    entry.category === 'Improved' ? 'bg-purple-100 text-purple-800' :
                                    entry.category === 'Deprecated' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {entry.category}
                                  </span>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      {/* JIRA Story Key */}
                                      {(entry as any).metadata?.jira_story_key && (
                                        <a 
                                          href={`https://marq.atlassian.net/browse/${(entry as any).metadata.jira_story_key}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full hover:bg-blue-200 transition-colors"
                                        >
                                          {(entry as any).metadata.jira_story_key}
                                        </a>
                                      )}
                                      
                                      {/* Related Stories */}
                                      {entry.related_stories && entry.related_stories.length > 0 && (
                                        <>
                                          {entry.related_stories.map((storyKey, index) => (
                                            <a 
                                              key={index}
                                              href={`https://marq.atlassian.net/browse/${storyKey}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full hover:bg-green-200 transition-colors"
                                              title={`Related story: ${storyKey}`}
                                            >
                                              {storyKey}
                                            </a>
                                          ))}
                                        </>
                                      )}
                                      
                                      {/* Priority Badge */}
                                      {(entry as any).metadata?.priority && (
                                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getJiraPriorityColor((entry as any).metadata.priority)}`}>
                                          {(entry as any).metadata.priority}
                                        </span>
                                      )}
                                      
                                      {/* Category Badge */}
                                      <span className={`calendly-badge ${getCategoryColor(entry.category)}`}>
                                        {entry.category}
                                      </span>
                                    </div>
                                    
                                    <h3 className="calendly-h3" style={{ marginBottom: '4px' }}>
                                      {entry.customer_facing_title}
                                    </h3>
                                    
                                    <p className="calendly-label-sm text-gray-500">
                                      {(entry as any).metadata?.webhook_timestamp && (
                                        <span>Generated {formatTimeAgo((entry as any).metadata.webhook_timestamp)} • </span>
                                      )}
                                      {(entry as any).metadata?.ai_provider && (
                                        <span>AI Generated ({(entry as any).metadata.ai_provider})</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <button 
                                    className="calendly-btn-secondary text-sm"
                                    onClick={() => handleEditEntry(entry)}
                                  >
                                    Edit
                                  </button>
                                </div>
                              </div>

                              {/* Content */}
                              <div style={{ marginBottom: '16px' }}>
                                <p className="calendly-body-sm text-gray-700" style={{ marginBottom: '12px' }}>
                                  {entry.customer_facing_description}
                                </p>
                              </div>

                              {/* Key Changes Section */}
                              {entry.highlights && entry.highlights.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Key Changes:</h4>
                                  <ul className="space-y-1">
                                    {entry.highlights.slice(0, 3).map((highlight, index) => (
                                      <li key={index} className="flex items-start space-x-2">
                                        <span className="text-green-500 mt-1">•</span>
                                        <span className="calendly-body-sm text-gray-700">{highlight}</span>
                                      </li>
                                    ))}
                                    {entry.highlights.length > 3 && (
                                      <li className="calendly-body-sm text-gray-500 italic">
                                        +{entry.highlights.length - 3} more changes
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}

                              {/* Optional Media Display */}
                              {((entry as any).external_link || (entry as any).video_url || (entry as any).image_url) && (
                                <div style={{ marginBottom: '16px' }}>
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Resources:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {(entry as any).external_link && (
                                      <a href={(entry as any).external_link} target="_blank" rel="noopener noreferrer" 
                                         className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100 transition-colors">
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Learn More</span>
                                      </a>
                                    )}
                                    {(entry as any).video_url && (
                                      <a href={(entry as any).video_url} target="_blank" rel="noopener noreferrer"
                                         className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full hover:bg-purple-100 transition-colors">
                                        <span>Watch Video</span>
                                      </a>
                                    )}
                                    {(entry as any).image_url && (
                                      <a href={(entry as any).image_url} target="_blank" rel="noopener noreferrer"
                                         className="inline-flex items-center space-x-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full hover:bg-green-100 transition-colors">
                                        <span>View Image</span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Key Details Row */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: '16px' }}>
                                {entry.breaking_changes && (
                                  <div className="flex items-center space-x-2">
                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                    <span className="calendly-body-sm text-red-600">Breaking Changes</span>
                                  </div>
                                )}
                                
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-blue-500" />
                                  <span className="calendly-body-sm">
                                    Quality Score: {Math.round((entry.quality_score || 0.85) * 100)}%
                                  </span>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`public-${entry.id}`}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                  defaultChecked={true}
                                />
                                <label htmlFor={`public-${entry.id}`} className="calendly-body-sm text-gray-700">
                                  Make public
                                </label>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <button 
                                className="calendly-btn-secondary"
                                onClick={() => handleRejectEntry(entry.id)}
                              >
                                Reject
                              </button>
                              <button 
                                className="calendly-btn-primary"
                                onClick={() => {
                                  const checkbox = document.getElementById(`public-${entry.id}`) as HTMLInputElement;
                                  const makePublic = checkbox?.checked ?? true;
                                  handleApproveEntry(entry.id, makePublic);
                                }}
                              >
                                Approve & Publish
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              ) : (
                <div className="calendly-card text-center py-12">
                  {/* No Pending Entries */}
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h3 className="calendly-h3" style={{ marginBottom: '8px' }}>All Caught Up!</h3>
                  <p className="calendly-body" style={{ marginBottom: '24px' }}>
                    No changelog entries are currently pending approval. New entries from JIRA will appear here automatically.
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <button 
                      className="calendly-btn-secondary"
                      onClick={() => setActiveTab('changelog')}
                    >
                      View Published Entries
                    </button>
                    <button className="calendly-btn-primary">
                      Create Manual Entry
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Empty State */}
          {activeTab === 'changelog' && filteredChangelog.length === 0 && (
            <div className="calendly-card text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
              <h3 className="calendly-h3" style={{ marginBottom: '8px' }}>No Changelog Entries</h3>
              <p className="calendly-body">
                No changelog entries match your current filters. Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
