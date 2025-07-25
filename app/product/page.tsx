'use client';

import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
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
  Activity
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

interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  version: string;
  published_at: string;
  type: 'feature' | 'improvement' | 'fix' | 'security';
  highlights: string[];
  breaking_changes: string[];
  migration_notes?: string;
  view_count: number;
  upvotes: number;
  feedback_count: number;
}

export default function ProductPage() {
  const [activeTab, setActiveTab] = useState<'updates' | 'changelog' | 'roadmap'>('updates');
  const [productUpdates, setProductUpdates] = useState<ProductUpdate[]>([]);
  const [changelogEntries, setChangelogEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Updates filters
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | string>('all');
  
  // Changelog filters
  const [versionFilter, setVersionFilter] = useState<'all' | string>('all');
  const [changelogTypeFilter, setChangelogTypeFilter] = useState<'all' | string>('all');
  
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

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

  // Mock changelog entries
  const mockChangelogEntries: ChangelogEntry[] = [
    {
      id: 'changelog-001',
      title: 'v2.4.1 - Enhanced Analytics & Performance',
      description: 'Major improvements to dashboard analytics with real-time data updates and performance optimizations.',
      version: 'v2.4.1',
      published_at: '2024-01-15T14:00:00Z',
      type: 'feature',
      highlights: [
        'Real-time dashboard analytics',
        'Customizable widget layouts',
        '40% faster page load times',
        'New data visualization options'
      ],
      breaking_changes: [],
      view_count: 342,
      upvotes: 28,
      feedback_count: 12
    },
    {
      id: 'changelog-002',
      title: 'v2.4.0 - Export Improvements & Bug Fixes',
      description: 'Significant improvements to data export functionality with performance enhancements and bug fixes.',
      version: 'v2.4.0',
      published_at: '2024-01-13T10:00:00Z',
      type: 'improvement',
      highlights: [
        'Export speed improved by 65%',
        'Support for larger datasets',
        'Fixed memory leak issues',
        'Better error handling'
      ],
      breaking_changes: [],
      migration_notes: 'No migration required for this update.',
      view_count: 189,
      upvotes: 15,
      feedback_count: 8
    },
    {
      id: 'changelog-003',
      title: 'v2.3.5 - Security Updates',
      description: 'Important security updates and vulnerability patches.',
      version: 'v2.3.5',
      published_at: '2024-01-08T09:30:00Z',
      type: 'security',
      highlights: [
        'Enhanced authentication security',
        'API vulnerability patches',
        'Updated dependencies',
        'Improved access controls'
      ],
      breaking_changes: [
        'API authentication now requires additional headers'
      ],
      migration_notes: 'Update your API calls to include the new X-API-Version header.',
      view_count: 267,
      upvotes: 22,
      feedback_count: 5
    }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setProductUpdates(mockProductUpdates);
      setChangelogEntries(mockChangelogEntries);
      setLoading(false);
    }, 1000);
  }, []);

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

  const getChangelogTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'calendly-badge-success';
      case 'improvement': return 'calendly-badge-info';
      case 'fix': return 'calendly-badge-warning';
      case 'security': return 'calendly-badge-danger';
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
    const matchesSearch = !searchQuery || 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.version.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesVersion = versionFilter === 'all' || entry.version === versionFilter;
    const matchesType = changelogTypeFilter === 'all' || entry.type === changelogTypeFilter;
    
    return matchesSearch && matchesVersion && matchesType;
  });

  const handleUpdateClick = (updateId: string) => {
    console.log('View update:', updateId);
  };

  const handleChangelogClick = (entryId: string) => {
    console.log('View changelog:', entryId);
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
              <h1 className="calendly-h1">Product</h1>
              <p className="calendly-body">Product updates, changelog, and development roadmap</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="calendly-btn-secondary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              {activeTab === 'updates' && (
                <button className="calendly-btn-primary flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>New Update</span>
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Total Updates</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{productUpdates.length}</p>
                </div>
                <Package className="w-8 h-8" style={{ color: '#4285f4' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>In Development</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>
                    {productUpdates.filter(u => u.status === 'development').length}
                  </p>
                </div>
                <Settings className="w-8 h-8" style={{ color: '#f59e0b' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Published</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>
                    {productUpdates.filter(u => u.status === 'published').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8" style={{ color: '#10b981' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Affected Users</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>
                    {productUpdates.reduce((sum, u) => sum + u.affected_customers, 0).toLocaleString()}
                  </p>
                </div>
                <Users className="w-8 h-8" style={{ color: '#6366f1' }} />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="calendly-card" style={{ marginBottom: '24px', padding: 0 }}>
            <div className="flex border-b" style={{ borderColor: '#e2e8f0' }}>
              <button
                onClick={() => setActiveTab('updates')}
                className="py-4 px-6 border-b-2 calendly-body-sm font-medium transition-colors"
                style={activeTab === 'updates' ? {
                  borderBottomColor: '#4285f4',
                  color: '#4285f4'
                } : {
                  borderBottomColor: 'transparent',
                  color: '#718096'
                }}
              >
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Product Updates</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('changelog')}
                className="py-4 px-6 border-b-2 calendly-body-sm font-medium transition-colors"
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
                  <span>Changelog</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('roadmap')}
                className="py-4 px-6 border-b-2 calendly-body-sm font-medium transition-colors"
                style={activeTab === 'roadmap' ? {
                  borderBottomColor: '#4285f4',
                  color: '#4285f4'
                } : {
                  borderBottomColor: 'transparent',
                  color: '#718096'
                }}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Roadmap</span>
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
                      <option value="development">Development</option>
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
                      <option value="all">All Types</option>
                      <option value="feature">Features</option>
                      <option value="improvement">Improvements</option>
                      <option value="fix">Bug Fixes</option>
                      <option value="security">Security</option>
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
          {activeTab === 'updates' ? (
            viewMode === 'cards' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredUpdates.map((update) => {
                  const TypeIcon = getTypeIcon(update.type);
                  return (
                    <div
                      key={update.id}
                      onClick={() => handleUpdateClick(update.id)}
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
                      {/* Update Header */}
                      <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
                        <div className="flex items-center space-x-3">
                          <TypeIcon className="w-6 h-6" style={{ color: '#4285f4' }} />
                          <div className="flex-1">
                            <h3 className="calendly-h3" style={{ marginBottom: '2px' }}>{update.title}</h3>
                            <p className="calendly-label-sm">{update.jira_story_key} • {update.release_version}</p>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1 ml-4">
                          <span className={`calendly-badge ${getStatusColor(update.status)}`}>
                            {update.status.replace('_', ' ')}
                          </span>
                          <span className={`calendly-badge ${getPriorityColor(update.priority)}`}>
                            {update.priority}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="calendly-body-sm line-clamp-2" style={{ marginBottom: '16px' }}>
                        {update.description}
                      </p>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '16px' }}>
                        <div>
                          <p className="calendly-label-sm">Affected Customers</p>
                          <p className="calendly-body font-medium">{update.affected_customers.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="calendly-label-sm">Team</p>
                          <p className="calendly-body font-medium">{update.assigned_team}</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div style={{ marginBottom: '16px' }}>
                        <div className="flex flex-wrap gap-2">
                          {update.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                          {update.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{update.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                        <div className="flex items-center space-x-2">
                          <span className={`calendly-badge ${getTypeColor(update.type)}`}>
                            {update.type.replace('_', ' ')}
                          </span>
                          {update.changelog_published && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <span className="calendly-label-sm">
                          {update.completion_date 
                            ? formatDistanceToNow(new Date(update.completion_date), { addSuffix: true })
                            : 'In progress'
                          }
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Updates Table View */
              <div className="calendly-card" style={{ padding: 0 }}>
                <div className="overflow-x-auto">
                  <table className="calendly-table">
                    <thead>
                      <tr>
                        <th>Update</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Version</th>
                        <th>Team</th>
                        <th>Completed</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUpdates.map((update) => {
                        const TypeIcon = getTypeIcon(update.type);
                        return (
                          <tr key={update.id} className="cursor-pointer" onClick={() => handleUpdateClick(update.id)}>
                            <td>
                              <div className="flex items-center space-x-3">
                                <TypeIcon className="w-5 h-5" style={{ color: '#4285f4' }} />
                                <div>
                                  <div className="font-medium">{update.title}</div>
                                  <div className="text-sm text-gray-600">{update.jira_story_key}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`calendly-badge ${getTypeColor(update.type)}`}>
                                {update.type.replace('_', ' ')}
                              </span>
                            </td>
                            <td>
                              <span className={`calendly-badge ${getStatusColor(update.status)}`}>
                                {update.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td>
                              <span className={`calendly-badge ${getPriorityColor(update.priority)}`}>
                                {update.priority}
                              </span>
                            </td>
                            <td>{update.release_version}</td>
                            <td>{update.assigned_team}</td>
                            <td>
                              {update.completion_date 
                                ? formatDistanceToNow(new Date(update.completion_date), { addSuffix: true })
                                : '-'
                              }
                            </td>
                            <td>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateClick(update.id);
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
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : activeTab === 'changelog' ? (
            /* Changelog Display */
            <div className="space-y-6">
              {filteredChangelog.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => handleChangelogClick(entry.id)}
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
                  {/* Changelog Header */}
                  <div className="flex items-start justify-between" style={{ marginBottom: '16px' }}>
                    <div className="flex items-center space-x-3">
                      <GitBranch className="w-6 h-6" style={{ color: '#4285f4' }} />
                      <div>
                        <h3 className="calendly-h3" style={{ marginBottom: '4px' }}>{entry.title}</h3>
                        <p className="calendly-label-sm">
                          {formatDistanceToNow(new Date(entry.published_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`calendly-badge ${getChangelogTypeColor(entry.type)}`}>
                        {entry.type}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="calendly-body-sm" style={{ marginBottom: '16px' }}>
                    {entry.description}
                  </p>

                  {/* Highlights */}
                  <div style={{ marginBottom: '16px' }}>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Highlights</h4>
                    <ul className="space-y-1">
                      {entry.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="calendly-body-sm">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Breaking Changes */}
                  {entry.breaking_changes.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 className="text-sm font-medium text-red-900 mb-2">Breaking Changes</h4>
                      <ul className="space-y-1">
                        {entry.breaking_changes.map((change, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="calendly-body-sm text-red-700">{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Footer */}
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
                    <ExternalLink className="w-4 h-4" style={{ color: '#718096' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Roadmap Placeholder */
            <div className="calendly-card text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
              <h3 className="calendly-h3" style={{ marginBottom: '8px' }}>Roadmap Coming Soon</h3>
              <p className="calendly-body" style={{ marginBottom: '24px' }}>
                Product roadmap visualization will be available in a future update
              </p>
            </div>
          )}

          {/* Empty State */}
          {((activeTab === 'updates' && filteredUpdates.length === 0) || 
            (activeTab === 'changelog' && filteredChangelog.length === 0)) && (
            <div className="calendly-card text-center py-12">
              {activeTab === 'updates' ? (
                <Package className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
              ) : (
                <GitBranch className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
              )}
              <h3 className="calendly-h3" style={{ marginBottom: '8px' }}>
                No {activeTab === 'updates' ? 'updates' : 'changelog entries'} found
              </h3>
              <p className="calendly-body" style={{ marginBottom: '24px' }}>
                {searchQuery || (activeTab === 'updates' ? (typeFilter !== 'all' || statusFilter !== 'all') : changelogTypeFilter !== 'all')
                  ? 'Try adjusting your search or filters' 
                  : `${activeTab === 'updates' ? 'Product updates' : 'Changelog entries'} will appear here`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}