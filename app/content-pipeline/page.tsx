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
  Filter
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

  useEffect(() => {
    fetchContentItems();
  }, []);

  const fetchContentItems = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockItems: ContentItem[] = [
        {
          id: '1',
          title: 'How AI-Powered Data Export Transformed TechCorp\'s Operations',
          type: 'blog',
          status: 'published',
          author: 'Sarah Chen',
          published_date: '2024-01-15',
          created_date: '2024-01-10',
          description: 'A deep dive into how our latest AI-powered data export feature helped TechCorp reduce processing time by 80%.',
          feature_title: 'AI-Powered Data Export',
          feature_category: 'Data Management',
          reading_time: 6,
          tags: ['AI', 'Data Export', 'Customer Success', 'Automation'],
          featured_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=240&fit=crop',
          excerpt: 'Discover how TechCorp reduced their data processing time by 80% using our new AI-powered export feature.',
          slug: 'ai-powered-data-export-techcorp-success',
          views: 2847,
          engagement: 78
        },
        {
          id: '2',
          title: 'Enterprise Solutions Inc: A Complete Digital Transformation',
          type: 'case_study',
          status: 'published',
          author: 'Michael Rodriguez',
          published_date: '2024-01-12',
          created_date: '2024-01-08',
          description: 'Complete case study showing how Enterprise Solutions Inc achieved 150% ROI through our platform.',
          feature_title: 'Real-time Dashboard Widgets',
          feature_category: 'User Interface',
          reading_time: 8,
          tags: ['Case Study', 'Enterprise', 'ROI', 'Digital Transformation'],
          featured_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=240&fit=crop',
          excerpt: 'Learn how Enterprise Solutions Inc transformed their business operations and achieved 150% ROI.',
          slug: 'enterprise-solutions-digital-transformation',
          views: 1923,
          engagement: 82
        },
        {
          id: '3',
          title: 'Introducing Advanced Security Framework: Enterprise-Grade Protection',
          type: 'press_release',
          status: 'published',
          author: 'Lisa Park',
          published_date: '2024-01-08',
          created_date: '2024-01-05',
          description: 'Press release announcing our new enterprise-grade security framework with advanced authentication.',
          feature_title: 'Advanced Security Framework',
          feature_category: 'Security',
          reading_time: 4,
          tags: ['Security', 'Enterprise', 'Press Release', 'Authentication'],
          featured_image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=240&fit=crop',
          excerpt: 'We\'re excited to announce our new enterprise-grade security framework with advanced authentication.',
          slug: 'advanced-security-framework-announcement',
          views: 3241,
          engagement: 65
        },
        {
          id: '4',
          title: 'The Future of Mobile Integration: Offline-First Architecture',
          type: 'blog',
          status: 'review',
          author: 'David Kim',
          created_date: '2024-01-14',
          description: 'Exploring the benefits of offline-first architecture for mobile teams and remote workers.',
          feature_title: 'Mobile App Integration',
          feature_category: 'Mobile',
          reading_time: 7,
          tags: ['Mobile', 'Architecture', 'Remote Work', 'Offline'],
          featured_image: '',
          excerpt: 'Learn how offline-first architecture is revolutionizing mobile app experiences for remote teams.',
          slug: 'future-mobile-integration-offline-first'
        },
        {
          id: '5',
          title: 'Q1 2024 Product Updates: What\'s New and What\'s Coming',
          type: 'newsletter',
          status: 'draft',
          author: 'Jennifer Wu',
          created_date: '2024-01-16',
          description: 'Quarterly newsletter highlighting all the new features and improvements from Q1 2024.',
          feature_title: 'Multiple Features',
          feature_category: 'Product Updates',
          reading_time: 5,
          tags: ['Newsletter', 'Product Updates', 'Q1 2024', 'Features'],
          featured_image: '',
          excerpt: 'Catch up on all the exciting new features and improvements we shipped in Q1 2024.',
          slug: 'q1-2024-product-updates-newsletter'
        },
        {
          id: '6',
          title: 'Customer Feedback Portal: Closing the Loop on Product Development',
          type: 'blog',
          status: 'draft',
          author: 'Alex Thompson',
          created_date: '2024-01-18',
          description: 'How our upcoming customer feedback portal will revolutionize product development cycles.',
          feature_title: 'Customer Feedback Portal',
          feature_category: 'Customer Experience',
          reading_time: 6,
          tags: ['Customer Feedback', 'Product Development', 'UX', 'Coming Soon'],
          featured_image: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=400&h=240&fit=crop',
          excerpt: 'Preview our upcoming customer feedback portal and how it will transform product development.',
          slug: 'customer-feedback-portal-product-development'
        }
      ];

      setContentItems(mockItems);
      
      // Calculate stats
      const published = mockItems.filter(item => item.status === 'published');
      const totalViews = published.reduce((sum, item) => sum + (item.views || 0), 0);
      const avgEngagement = published.reduce((sum, item) => sum + (item.engagement || 0), 0) / published.length;
      
      setStats({
        total_posts: mockItems.length,
        published: published.length,
        drafts: mockItems.filter(item => item.status === 'draft').length,
        views_this_month: totalViews,
        engagement_rate: Math.round(avgEngagement)
      });
      
    } catch (error) {
      console.error('Error fetching content items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTypeFilter = selectedFilter === 'all' || item.type === selectedFilter;
    const matchesStatusFilter = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesTypeFilter && matchesStatusFilter;
  });

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

  const handleViewContent = (item: ContentItem) => {
    if (item.status === 'published') {
      window.open(`/content/${item.slug}`, '_blank');
    } else {
      // Show preview for unpublished content
      alert(`Preview: ${item.title}\n\n${item.excerpt}`);
    }
  };

  const handleEditContent = (item: ContentItem) => {
    // Navigate to create page with edit parameters
    const params = new URLSearchParams({
      edit: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      feature: '1'
    });
    const editUrl = `/content-pipeline/create?${params.toString()}`;
    window.location.href = editUrl;
  };

  const handleCreateContent = () => {
    window.location.href = '/content-pipeline/create';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Pipeline</h1>
              <p className="text-gray-600">Create and manage marketing content from product features</p>
            </div>
            <button
              onClick={handleCreateContent}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Create Content</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_posts}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.published}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.drafts}</p>
                </div>
                <Edit className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Views This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.views_this_month.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.engagement_rate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search content..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Type Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as any)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="blog">Blog Posts</option>
                  <option value="case_study">Case Studies</option>
                  <option value="press_release">Press Releases</option>
                  <option value="newsletter">Newsletters</option>
                </select>
              </div>
              
              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="review">In Review</option>
                  <option value="draft">Drafts</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const StatusIcon = getStatusIcon(item.status);
              const TypeIcon = getTypeIcon(item.type);
              
              return (
                <div
                  key={item.id}
                  className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Featured Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                    {item.featured_image && item.featured_image !== '/api/placeholder/400/240' ? (
                      <img
                        src={item.featured_image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-2 bg-white/30 rounded-full flex items-center justify-center">
                            <FileText className="w-8 h-8 text-blue-600/60" />
                          </div>
                          <p className="text-sm font-medium text-blue-800/70">{item.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex items-center space-x-2">
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
                  
                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{item.author}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{item.reading_time} min read</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.excerpt}</p>
                    
                    {/* Feature Info */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-900">Based on: {item.feature_title}</p>
                          <p className="text-xs text-blue-700">{item.feature_category}</p>
                        </div>
                        <Tag className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg">
                          +{item.tags.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    {/* Stats (for published content) */}
                    {item.status === 'published' && (
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{item.views?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>{item.engagement}%</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.published_date!)}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Date (for unpublished content) */}
                    {item.status !== 'published' && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>Created {formatDate(item.created_date)}</span>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewContent(item)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>{item.status === 'published' ? 'View' : 'Preview'}</span>
                      </button>
                      <button
                        onClick={() => handleEditContent(item)}
                        className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {item.status === 'published' && (
                        <button
                          onClick={() => window.open(`/content/${item.slug}`, '_blank')}
                          className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating your first piece of content'}
              </p>
              <button
                onClick={handleCreateContent}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Create Content</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}