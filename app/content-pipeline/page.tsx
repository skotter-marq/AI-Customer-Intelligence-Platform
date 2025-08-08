'use client';

import { useState, useEffect } from 'react';
import { 
  Plus,
  Edit,
  Eye,
  Calendar,
  User,
  Tag,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  FileText,
  BookOpen,
  Globe,
  TrendingUp,
  Copy,
  Download,
  Search,
  Filter,
  Upload,
  X,
  Grid3X3,
  List,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Square,
  CheckSquare,
  Trash2
} from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: 'blog' | 'case_study' | 'press_release' | 'newsletter';
  status: 'draft' | 'review' | 'published';
  author: string;
  published_date?: string;
  created_date: string;
  description: string;
  feature_title: string;
  feature_category: string;
  reading_time: number;
  tags: string[];
  featured_image: string;
  excerpt: string;
  slug: string;
  views?: number;
  engagement?: number;
  // Step 3 completion fields
  selected_layout?: string;
  generated_content?: {
    sections: {
      title: string;
      content: string;
      type: 'text' | 'video' | 'image' | 'code' | 'quote';
    }[];
  };
  layout_completed?: boolean;
}

interface ContentStats {
  total_posts: number;
  published: number;
  drafts: number;
  views_this_month: number;
  engagement_rate: number;
}

export default function ContentPipelinePage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [displayOrderItems, setDisplayOrderItems] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState<ContentStats>({
    total_posts: 0,
    published: 0,
    drafts: 0,
    views_this_month: 0,
    engagement_rate: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'blog' | 'case_study' | 'press_release' | 'newsletter'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'review' | 'published'>('all');
  const [loading, setLoading] = useState(true);
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    isOpen: boolean;
    item: ContentItem | null;
    newStatus: 'draft' | 'published';
  }>({
    isOpen: false,
    item: null,
    newStatus: 'draft'
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('compact');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'type' | 'status' | 'engagement'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  useEffect(() => {
    fetchContentItems();
  }, []);

  // Apply sorting when sort settings change
  useEffect(() => {
    if (contentItems.length > 0) {
      applySorting(contentItems);
    }
  }, [sortBy, sortOrder]);

  // Initialize display order when contentItems first loads
  useEffect(() => {
    if (contentItems.length > 0 && displayOrderItems.length === 0) {
      applySorting(contentItems);
    }
  }, [contentItems]);

  // Helper function to get actual content from localStorage
  const getActualContentFromLocalStorage = (): ContentItem[] => {
    const actualItems: ContentItem[] = [];
    
    try {
      // Look for all content status keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('content_status_')) {
          try {
            const statusData = JSON.parse(localStorage.getItem(key) || '{}');
            
            if (statusData.title) {
              const contentId = key.replace('content_status_', '');
              
              // Generate slug from title
              const slug = statusData.title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
              
              // Create content item
              const contentItem: ContentItem = {
                id: contentId,
                title: statusData.title,
                type: statusData.type || 'blog',
                status: statusData.status || 'draft',
                author: 'Content Creator',
                published_date: statusData.status === 'published' ? (statusData.publishedAt || statusData.savedAt) : null,
                created_date: statusData.savedAt || new Date().toISOString(),
                description: `Created with Content Builder - ${statusData.type || 'Blog'} content`,
                feature_title: statusData.title,
                feature_category: statusData.type || 'General',
                reading_time: 5,
                tags: ['Content Builder', statusData.type || 'Blog'],
                featured_image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=240&fit=crop',
                excerpt: `${statusData.title} - Created with Content Builder`,
                slug: slug,
                views: Math.floor(Math.random() * 1000), // Random views for demo
                engagement: Math.floor(Math.random() * 100), // Random engagement for demo
                selected_layout: 'content_builder',
                layout_completed: true,
                generated_content: {
                  sections: [
                    {
                      title: 'Content',
                      content: 'Rich content created with Content Builder',
                      type: 'text'
                    }
                  ]
                }
              };
              
              actualItems.push(contentItem);
            }
          } catch (parseError) {
            console.warn('Failed to parse content status:', key, parseError);
          }
        }
      }
      
      // Sort by created date (newest first)
      actualItems.sort((a, b) => 
        new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
      );
      
    } catch (error) {
      console.error('Error reading content from localStorage:', error);
    }
    
    return actualItems;
  };

  const fetchContentItems = async () => {
    try {
      setLoading(true);
      console.log('📋 CONTENT PIPELINE: Loading actual content from localStorage');
      
      // Get actual content created through Content Builder
      const actualItems = getActualContentFromLocalStorage();
      
      setContentItems(actualItems);

      
      // Calculate stats from actual content
      const published = actualItems.filter(item => item.status === 'published');
      const totalViews = published.reduce((sum, item) => sum + (item.views || 0), 0);
      const avgEngagement = published.length > 0 
        ? published.reduce((sum, item) => sum + (item.engagement || 0), 0) / published.length 
        : 0;
      
      setStats({
        total_posts: actualItems.length,
        published: published.length,
        drafts: actualItems.filter(item => item.status === 'draft').length,
        views_this_month: totalViews,
        engagement_rate: Math.round(avgEngagement)
      });
      
      console.log('📊 CONTENT PIPELINE: Loaded', actualItems.length, 'actual items');
      
    } catch (error) {
      console.error('Error fetching content items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check localStorage for updated status
  const getUpdatedStatus = (itemId: string, currentStatus: string) => {
    try {
      const statusKey = `content_status_${itemId}`;
      const statusData = localStorage.getItem(statusKey);
      if (statusData) {
        const parsed = JSON.parse(statusData);
        console.log(`📊 STATUS CHECK: Found updated status for ID ${itemId}:`, parsed.status);
        return parsed.status;
      }
    } catch (error) {
      console.warn('Error reading status from localStorage:', error);
    }
    return currentStatus;
  };

  // Use displayOrderItems for current display, but apply filters with updated status
  const filteredAndSortedItems = (displayOrderItems.length > 0 ? displayOrderItems : contentItems)
    .map(item => ({
      ...item,
      status: getUpdatedStatus(item.id, item.status)
    }))
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTypeFilter = selectedFilter === 'all' || item.type === selectedFilter;
      const matchesStatusFilter = statusFilter === 'all' || item.status === statusFilter;
      
      return matchesSearch && matchesTypeFilter && matchesStatusFilter;
    });

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const filteredItems = filteredAndSortedItems.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return CheckCircle;
      case 'review': return Clock;
      case 'draft': return Edit;
      default: return FileText;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return FileText;
      case 'case_study': return BookOpen;
      case 'press_release': return Globe;
      case 'newsletter': return Send;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blog': return 'bg-blue-100 text-blue-800';
      case 'case_study': return 'bg-purple-100 text-purple-800';
      case 'press_release': return 'bg-orange-100 text-orange-800';
      case 'newsletter': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };


  const handleEditContent = (item: ContentItem) => {
    // Check unified key first for the latest content and metadata
    const unifiedKey = `content_${item.id}_latest`;
    const savedContent = localStorage.getItem(unifiedKey);
    
    let latestType = item.type;
    let latestLayout = item.selected_layout || '';
    
    if (savedContent) {
      try {
        const parsedContent = JSON.parse(savedContent);
        if (parsedContent.currentContentType && parsedContent.currentLayout) {
          latestType = parsedContent.currentContentType;
          latestLayout = parsedContent.currentLayout;
          console.log('🔍 UNIFIED: Found latest content metadata');
          console.log('- Latest type:', latestType);
          console.log('- Latest layout:', latestLayout);
        }
      } catch (error) {
        console.warn('Error parsing unified content:', error);
      }
    } else {
      console.log('🔍 UNIFIED: No unified content found, using item defaults');
    }

    // Navigate to create page with edit parameters, using latest saved content type/layout
    const params = new URLSearchParams({
      edit: item.id,
      type: latestType,
      title: item.title,
      description: item.description,
      feature: '1',
      // Preserve Step 1 selections
      step1_complete: 'true',
      // Preserve Step 2 selections  
      step2_complete: 'true',
      feature_title: item.feature_title,
      feature_category: item.feature_category,
      // Preserve Step 3 selections
      step3_complete: item.layout_completed ? 'true' : 'false',
      selected_layout: latestLayout,
      // Navigate to Edit Content section (not step 3)
      section: 'edit-content'
    });
    const editUrl = `/content-pipeline/create?${params.toString()}`;
    console.log('🔗 UNIFIED EDIT: URL with latest content type/layout:', editUrl);
    window.location.href = editUrl;
  };

  const handleCreateContent = () => {
    window.location.href = '/content-pipeline/create';
  };

  const handleStatusChange = (item: ContentItem, newStatus: 'draft' | 'published') => {
    setStatusChangeDialog({
      isOpen: true,
      item,
      newStatus
    });
  };

  // Function to apply sorting and update display order
  const applySorting = (items: ContentItem[] = contentItems) => {
    const sorted = [...items].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          const dateA = new Date(a.published_date || a.created_date);
          const dateB = new Date(b.published_date || b.created_date);
          comparison = dateA.getTime() - dateB.getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'engagement':
          comparison = (a.engagement || 0) - (b.engagement || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setDisplayOrderItems(sorted);
  };

  const handleDirectStatusChange = async (item: ContentItem, newStatus: 'draft' | 'published') => {
    try {
      // Save current scroll position
      const scrollPosition = window.scrollY;
      
      console.log(`Changing status of "${item.title}" from ${item.status} to ${newStatus}`);
      
      // Update the item in the local state
      const updatedItems = contentItems.map(contentItem => {
        if (contentItem.id === item.id) {
          const updatedItem = { 
            ...contentItem, 
            status: newStatus as 'draft' | 'review' | 'published'
          };
          
          // Set published_date if publishing
          if (newStatus === 'published' && !updatedItem.published_date) {
            updatedItem.published_date = new Date().toISOString().split('T')[0];
          }
          
          // Remove published_date if unpublishing
          if (newStatus === 'draft' && updatedItem.published_date) {
            delete updatedItem.published_date;
          }
          
          // Update localStorage so getUpdatedStatus picks up the change
          const statusKey = `content_status_${item.id}`;
          const statusData = {
            status: newStatus,
            updatedAt: new Date().toISOString(),
            title: updatedItem.title,
            type: updatedItem.type || 'blog'
          };
          localStorage.setItem(statusKey, JSON.stringify(statusData));
          console.log(`💾 DIRECT STATUS SAVED: Item ${item.id} status updated to ${newStatus} in localStorage`);
          
          return updatedItem;
        }
        return contentItem;
      });
      
      // Update both contentItems and displayOrderItems while preserving current display order
      setContentItems(updatedItems);
      
      // Update displayOrderItems preserving current order
      setDisplayOrderItems(prevDisplayItems => {
        return prevDisplayItems.map(prevItem => {
          const updatedItem = updatedItems.find(ui => ui.id === prevItem.id);
          return updatedItem || prevItem;
        });
      });
      
      // Update stats
      const published = updatedItems.filter(item => item.status === 'published');
      const totalViews = published.reduce((sum, item) => sum + (item.views || 0), 0);
      const avgEngagement = published.reduce((sum, item) => sum + (item.engagement || 0), 0) / published.length;
      
      setStats({
        total_posts: updatedItems.length,
        published: published.length,
        drafts: updatedItems.filter(item => item.status === 'draft').length,
        views_this_month: totalViews,
        engagement_rate: Math.round(avgEngagement) || 0
      });

      // Log the status change to verify it's working
      console.log(`✅ Status updated! Item "${item.title}" is now ${newStatus}`);
      console.log(`📊 Updated stats - Published: ${published.length}, Drafts: ${updatedItems.filter(item => item.status === 'draft').length}`);
      
      // Restore scroll position after React re-renders
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 0);
      
    } catch (error) {
      console.error('Error changing status:', error);
    }
  };

  const confirmStatusChange = async () => {
    const { item, newStatus } = statusChangeDialog;
    if (!item) return;

    try {
      // TODO: Replace with actual API call
      console.log(`Changing status of "${item.title}" from ${item.status} to ${newStatus}`);
      
      // Update the item in the local state
      const updatedItems = contentItems.map(contentItem => {
        if (contentItem.id === item.id) {
          const updatedItem = { 
            ...contentItem, 
            status: newStatus as 'draft' | 'review' | 'published'
          };
          
          // Set published_date if publishing
          if (newStatus === 'published' && !updatedItem.published_date) {
            updatedItem.published_date = new Date().toISOString().split('T')[0];
          }
          
          // Remove published_date if unpublishing
          if (newStatus === 'draft' && updatedItem.published_date) {
            delete updatedItem.published_date;
          }
          
          return updatedItem;
        }
        return contentItem;
      });
      
      setContentItems(updatedItems);
      
      // Update stats
      const published = updatedItems.filter(item => item.status === 'published');
      const totalViews = published.reduce((sum, item) => sum + (item.views || 0), 0);
      const avgEngagement = published.reduce((sum, item) => sum + (item.engagement || 0), 0) / published.length;
      
      setStats({
        total_posts: updatedItems.length,
        published: published.length,
        drafts: updatedItems.filter(item => item.status === 'draft').length,
        views_this_month: totalViews,
        engagement_rate: Math.round(avgEngagement) || 0
      });
      
      // Close dialog
      setStatusChangeDialog({ isOpen: false, item: null, newStatus: 'draft' });
      
    } catch (error) {
      console.error('Error changing status:', error);
      // TODO: Show error message to user
    }
  };

  const cancelStatusChange = () => {
    setStatusChangeDialog({ isOpen: false, item: null, newStatus: 'draft' });
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const handleBulkStatusChange = async (newStatus: 'draft' | 'published') => {
    try {
      // TODO: Replace with actual API call
      console.log(`Bulk changing ${selectedItems.length} items to ${newStatus}`);
      
      const updatedItems = contentItems.map(item => {
        if (selectedItems.includes(item.id)) {
          const updatedItem = { ...item, status: newStatus as 'draft' | 'review' | 'published' };
          
          if (newStatus === 'published' && !updatedItem.published_date) {
            updatedItem.published_date = new Date().toISOString().split('T')[0];
          }
          
          if (newStatus === 'draft' && updatedItem.published_date) {
            delete updatedItem.published_date;
          }
          
          // Update localStorage for each item so getUpdatedStatus picks up the change
          const statusKey = `content_status_${item.id}`;
          const statusData = {
            status: newStatus,
            updatedAt: new Date().toISOString(),
            title: updatedItem.title,
            type: updatedItem.type || 'blog'
          };
          localStorage.setItem(statusKey, JSON.stringify(statusData));
          console.log(`💾 BULK STATUS SAVED: Item ${item.id} status updated to ${newStatus} in localStorage`);
          
          return updatedItem;
        }
        return item;
      });
      
      setContentItems(updatedItems);
      
      // Update displayOrderItems preserving current order
      setDisplayOrderItems(prevDisplayItems => {
        return prevDisplayItems.map(prevItem => {
          const updatedItem = updatedItems.find(ui => ui.id === prevItem.id);
          return updatedItem || prevItem;
        });
      });
      
      setSelectedItems([]);
      
      // Update stats
      const published = updatedItems.filter(item => item.status === 'published');
      const totalViews = published.reduce((sum, item) => sum + (item.views || 0), 0);
      const avgEngagement = published.reduce((sum, item) => sum + (item.engagement || 0), 0) / published.length;
      
      setStats({
        total_posts: updatedItems.length,
        published: published.length,
        drafts: updatedItems.filter(item => item.status === 'draft').length,
        views_this_month: totalViews,
        engagement_rate: Math.round(avgEngagement) || 0
      });
      
    } catch (error) {
      console.error('Error bulk changing status:', error);
    }
  };

  const handleDeleteContent = async (item: ContentItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log(`Deleting content: ${item.title}`);
      
      // Remove from content items
      const updatedItems = contentItems.filter(contentItem => contentItem.id !== item.id);
      setContentItems(updatedItems);
      
      // Remove from display order items
      setDisplayOrderItems(prevDisplayItems => 
        prevDisplayItems.filter(prevItem => prevItem.id !== item.id)
      );
      
      // Remove from selected items if it was selected
      setSelectedItems(prev => prev.filter(id => id !== item.id));
      
      // Remove from localStorage
      const statusKey = `content_status_${item.id}`;
      const unifiedKey = `content_${item.id}_latest`;
      localStorage.removeItem(statusKey);
      localStorage.removeItem(unifiedKey);
      
      // Update stats
      const published = updatedItems.filter(item => item.status === 'published');
      const totalViews = published.reduce((sum, item) => sum + (item.views || 0), 0);
      const avgEngagement = published.reduce((sum, item) => sum + (item.engagement || 0), 0) / published.length;
      
      setStats({
        total_posts: updatedItems.length,
        published: published.length,
        drafts: updatedItems.filter(item => item.status === 'draft').length,
        views_this_month: totalViews,
        engagement_rate: Math.round(avgEngagement) || 0
      });
      
      console.log(`✅ Content deleted: ${item.title}`);
      
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
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
              <h1 className="calendly-h1">Content Pipeline</h1>
              <p className="calendly-body">Create and manage marketing content from product features</p>
            </div>
            <button
              onClick={handleCreateContent}
              className="calendly-btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Content</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4" style={{ marginBottom: '24px' }}>
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Total Posts</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{stats.total_posts}</p>
                </div>
                <FileText className="w-8 h-8" style={{ color: '#4285f4' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Published</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{stats.published}</p>
                </div>
                <CheckCircle className="w-8 h-8" style={{ color: '#10b981' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Drafts</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{stats.drafts}</p>
                </div>
                <Edit className="w-8 h-8" style={{ color: '#f59e0b' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Views This Month</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{stats.views_this_month.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8" style={{ color: '#4285f4' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Engagement Rate</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{stats.engagement_rate}%</p>
                </div>
                <TrendingUp className="w-8 h-8" style={{ color: '#4285f4' }} />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="calendly-card" style={{ marginBottom: '24px' }}>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search content..."
                  className="w-full pl-12 pr-4 py-3 text-gray-900 placeholder:text-gray-500 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white hover:border-gray-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              
              {/* Filters Row */}
              <div className="flex flex-wrap gap-3">
                {/* Type Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value as any)}
                    className="px-4 py-2.5 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white hover:border-gray-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                  >
                    <option value="all">All Types</option>
                    <option value="blog">Blog Posts</option>
                    <option value="case_study">Case Studies</option>
                    <option value="press_release">Press Releases</option>
                    <option value="newsletter">Newsletters</option>
                  </select>
                </div>
                
                {/* Status Filter */}
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-gray-600" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-4 py-2.5 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white hover:border-gray-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="review">In Review</option>
                    <option value="draft">Drafts</option>
                  </select>
                </div>

                {/* Sort */}
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-600" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2.5 text-gray-900 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white hover:border-gray-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                  >
                    <option value="date">Date</option>
                    <option value="title">Title</option>
                    <option value="type">Type</option>
                    <option value="status">Status</option>
                    <option value="engagement">Engagement</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white hover:border-gray-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                  >
                    <ArrowUpDown className={`w-4 h-4 text-gray-600 ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                  </button>
                </div>

                {/* Clear Filters */}
                {(searchTerm || selectedFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'date') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedFilter('all');
                      setStatusFilter('all');
                      setSortBy('date');
                      setSortOrder('desc');
                    }}
                    className="p-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200"
                    title="Clear all filters"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* View Mode */}
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => {
                      console.log('Setting view mode to cards');
                      setViewMode('cards');
                    }}
                    className={`p-2.5 ${viewMode === 'cards' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900'} transition-all duration-200`}
                    title="Card view"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      console.log('Setting view mode to compact');
                      setViewMode('compact');
                    }}
                    className={`p-2.5 ${viewMode === 'compact' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white hover:text-gray-900'} transition-all duration-200`}
                    title="Compact view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Actions Toolbar */}
          {selectedItems.length > 0 && (
            <div className="p-4 mb-4 flex items-center justify-between" style={{
              background: '#dbeafe',
              border: '1px solid #93c5fd', 
              borderRadius: '12px'
            }}>
              <div className="flex items-center space-x-4">
                <span className="font-medium text-blue-900">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkStatusChange('published')}
                    className="calendly-btn-primary flex items-center space-x-1"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Publish All</span>
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('draft')}
                    className="calendly-btn-secondary flex items-center space-x-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Unpublish All</span>
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedItems([])}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Clear Selection
              </button>
            </div>
          )}

          {/* Content Display */}
          {(() => {
            console.log('Current viewMode:', viewMode);
            return viewMode === 'cards';
          })() ? (
            /* Card Grid View */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const StatusIcon = getStatusIcon(item.status);
              const TypeIcon = getTypeIcon(item.type);
              
              return (
                <div
                  key={item.id}
                  onClick={() => handleEditContent(item)}
                  className="calendly-card overflow-hidden group h-[480px] flex flex-col cursor-pointer relative"
                  style={{ 
                    padding: 0,
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    background: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#cbd5e0';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)';
                  }}
                >
                  
                  {/* Featured Image */}
                  <div className="relative h-24 overflow-hidden flex-shrink-0" style={{ background: '#f1f5f9' }}>
                    {item.featured_image && item.featured_image !== '/api/placeholder/400/240' ? (
                      <img
                        src={item.featured_image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-1 rounded-full flex items-center justify-center" style={{ background: 'white' }}>
                            <FileText className="w-6 h-6" style={{ color: '#4285f4' }} />
                          </div>
                          <p className="calendly-label-sm text-xs" style={{ color: '#4a5568' }}>{item.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                    )}
                    {/* Selection Circle */}
                    <div className="absolute top-4 left-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectItem(item.id);
                        }}
                        className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                          selectedItems.includes(item.id)
                            ? 'bg-blue-600 border-blue-600 shadow-lg'
                            : 'bg-white/90 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        {selectedItems.includes(item.id) && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </button>
                    </div>

                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                      <span className="calendly-badge calendly-badge-info flex items-center">
                        <TypeIcon className="w-3 h-3 mr-1" />
                        {item.type.replace('_', ' ')}
                      </span>
                      <span className={`calendly-badge ${
                        item.status === 'published' ? 'calendly-badge-success' :
                        item.status === 'review' ? 'calendly-badge-warning' :
                        'calendly-badge-info'
                      } flex items-center`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {item.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-1" />
                        <span>{item.author}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{item.reading_time} min read</span>
                      </div>
                    </div>
                    
                    <h3 className="text-base font-semibold line-clamp-2 text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm line-clamp-2 text-gray-600 mb-3">{item.excerpt}</p>
                    
                    {/* Feature Info - Simplified */}
                    <div className="p-2 rounded-lg mb-3 bg-blue-50">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-blue-800 truncate">
                            {item.feature_title}
                          </p>
                        </div>
                        <Tag className="w-4 h-4 flex-shrink-0 ml-2 text-blue-600" />
                      </div>
                    </div>
                    
                    {/* Tags - Simplified */}
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 2 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            +{item.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Metrics - Compact */}
                    <div className="bg-gray-50 p-2 rounded-lg mb-3">
                      {item.status === 'published' ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 text-sm">
                            <div className="flex items-center text-green-600">
                              <Eye className="w-3 h-3 mr-1" />
                              <span>{item.views?.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center text-blue-600">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              <span>{item.engagement}%</span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">{formatDate(item.published_date!)}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Draft</span>
                          <span className="text-xs text-gray-500">{formatDate(item.created_date)}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center space-x-3">
                        {/* Published Toggle Switch */}
                        <div className="flex items-center space-x-2">
                          <span className="calendly-body-sm" style={{ color: '#718096' }}>Published</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDirectStatusChange(item, item.status === 'published' ? 'draft' : 'published');
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                            style={{ background: item.status === 'published' ? '#10b981' : '#cbd5e0' }}
                            title={item.status === 'published' ? 'Click to unpublish' : 'Click to publish'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                item.status === 'published' ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditContent(item);
                          }}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: '#4285f4' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f0f4ff';
                            e.currentTarget.style.color = '#3367d6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#4285f4';
                          }}
                          title="Edit content"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.status === 'published' ? '/blog' : `/content/${item.slug}`, '_blank');
                          }}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: '#718096' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f0f4ff';
                            e.currentTarget.style.color = '#4285f4';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#718096';
                          }}
                          title={item.status === 'published' ? 'View on blog' : 'View on site'}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteContent(item);
                          }}
                          className="p-2 rounded-lg transition-colors"
                          style={{ color: '#ef4444' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#fee2e2';
                            e.currentTarget.style.color = '#dc2626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                          title="Delete content"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          ) : (
            /* List View */
            <div className="overflow-hidden" style={{ 
              padding: 0,
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              background: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'
            }}>
              <div className="divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const StatusIcon = getStatusIcon(item.status);
                  const TypeIcon = getTypeIcon(item.type);
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleEditContent(item)}
                      className="p-6 transition-colors cursor-pointer relative"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                      }}
                    >
                      {/* Selection Circle */}
                      <div className="absolute top-6 left-6">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectItem(item.id);
                          }}
                          className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                            selectedItems.includes(item.id)
                              ? 'bg-blue-600 border-blue-600 shadow-lg'
                              : 'bg-white border-gray-300 hover:border-blue-400'
                          }`}
                        >
                          {selectedItems.includes(item.id) && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </button>
                      </div>

                      <div className="ml-8 flex items-center justify-between">
                        {/* Left Content */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="calendly-h3 line-clamp-1" style={{ marginBottom: 0 }}>{item.title}</h3>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getTypeColor(item.type)}`}>
                                <TypeIcon className="w-3 h-3 mr-1" />
                                {item.type.replace('_', ' ')}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(item.status)}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {item.status}
                              </span>
                            </div>
                          </div>
                          
                          <p className="calendly-body-sm line-clamp-1" style={{ marginBottom: '8px' }}>{item.excerpt}</p>
                          
                          <div className="flex items-center space-x-4 calendly-body-sm" style={{ color: '#718096' }}>
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{item.author}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{item.reading_time} min read</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{item.status === 'published' ? formatDate(item.published_date!) : `Created ${formatDate(item.created_date)}`}</span>
                            </div>
                            {item.status === 'published' && (
                              <>
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-4 h-4" />
                                  <span>{item.views?.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <TrendingUp className="w-4 h-4" />
                                  <span>{item.engagement}%</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center space-x-2">
                          {/* Published Toggle */}
                          <div className="flex items-center space-x-2">
                            <span className="calendly-body-sm" style={{ color: '#718096' }}>Published</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDirectStatusChange(item, item.status === 'published' ? 'draft' : 'published');
                              }}
                              className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                              style={{ background: item.status === 'published' ? '#10b981' : '#cbd5e0' }}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                  item.status === 'published' ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>

                          {/* Action Buttons */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditContent(item);
                            }}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: '#4285f4' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f0f4ff';
                              e.currentTarget.style.color = '#3367d6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#4285f4';
                            }}
                            title="Edit content"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(item.status === 'published' ? '/blog' : `/content/${item.slug}`, '_blank');
                            }}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: '#718096' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f0f4ff';
                              e.currentTarget.style.color = '#4285f4';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#718096';
                            }}
                            title={item.status === 'published' ? 'View on blog' : 'View on site'}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteContent(item);
                            }}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: '#ef4444' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#fee2e2';
                              e.currentTarget.style.color = '#dc2626';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#ef4444';
                            }}
                            title="Delete content"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
              <h3 className="calendly-h3" style={{ marginBottom: '8px' }}>No content found</h3>
              <p className="calendly-body" style={{ marginBottom: '24px' }}>
                {searchTerm || selectedFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'No content has been created yet. Use the Content Builder to create your first article, case study, or press release.'}
              </p>
              <button
                onClick={handleCreateContent}
                className="calendly-btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Content</span>
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredAndSortedItems.length > itemsPerPage && (
            <div className="calendly-card flex items-center justify-between mt-8">
              <div className="flex items-center space-x-4">
                <span className="calendly-body-sm">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} items
                </span>
                <div className="flex items-center space-x-2">
                  <span className="calendly-body-sm">Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      const newItemsPerPage = parseInt(e.target.value);
                      setCurrentPage(1);
                      // Update itemsPerPage - you'd need to make this a state variable
                    }}
                    className="px-2 py-1 rounded calendly-body-sm" 
                    style={{ border: '1px solid #e2e8f0', background: 'white' }}
                    onFocus={(e) => {
                      e.currentTarget.style.outline = 'none';
                      e.currentTarget.style.boxShadow = '0 0 0 2px #4285f4';
                      e.currentTarget.style.borderColor = '#4285f4';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                    <option value={96}>96</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ border: '1px solid #e2e8f0' }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.background = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
                    if (pageNumber <= totalPages) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className="px-3 py-1 rounded-lg calendly-body-sm transition-colors"
                          style={currentPage === pageNumber ? {
                            background: '#4285f4',
                            color: 'white'
                          } : {
                            color: '#718096'
                          }}
                          onMouseEnter={(e) => {
                            if (currentPage !== pageNumber) {
                              e.currentTarget.style.background = '#f1f5f9';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentPage !== pageNumber) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ border: '1px solid #e2e8f0' }}
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.background = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Select All Toggle */}
          {filteredItems.length > 0 && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 px-4 py-2 calendly-body-sm transition-colors"
                style={{ color: '#718096' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#4285f4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#718096';
                }}
              >
                {selectedItems.length === filteredItems.length ? (
                  <>
                    <CheckSquare className="w-4 h-4" />
                    <span>Deselect All ({filteredItems.length})</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4" />
                    <span>Select All ({filteredItems.length})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Change Confirmation Dialog */}
      {statusChangeDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Status Change
              </h3>
              <button
                onClick={cancelStatusChange}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Are you sure you want to {statusChangeDialog.newStatus === 'published' ? 'publish' : 'unpublish'} this content?
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">
                  {statusChangeDialog.item?.title}
                </h4>
                <p className="text-xs text-gray-500">
                  {statusChangeDialog.item?.type.replace('_', ' ')} • {statusChangeDialog.item?.author}
                </p>
              </div>
              {statusChangeDialog.newStatus === 'published' && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ This content will become publicly visible immediately.
                </p>
              )}
              {statusChangeDialog.newStatus === 'draft' && (
                <p className="text-sm text-orange-600 mt-2">
                  ⚠ This content will be removed from public view.
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={cancelStatusChange}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  statusChangeDialog.newStatus === 'published'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {statusChangeDialog.newStatus === 'published' ? 'Publish' : 'Unpublish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}