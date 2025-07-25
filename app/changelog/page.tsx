'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  Search,
  Filter,
  Calendar,
  Tag,
  Users,
  Clock,
  Edit3,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Star,
  Zap
} from 'lucide-react';

interface ChangelogEntry {
  id: string;
  content_title: string;
  generated_content: string;
  content_type: string;
  target_audience: string;
  status: string;
  quality_score: number;
  published_at: string;
  tldr_summary?: string;
  tldr_bullet_points?: string[];
  tags?: string[];
  update_category?: string;
  importance_score?: number;
  breaking_changes?: boolean;
  is_public?: boolean;
  public_changelog_visible?: boolean;
}

interface FilterOptions {
  contentType: string;
  category: string;
  audience: string;
  timeRange: string;
  visibility: string;
}

export default function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    contentType: 'all',
    category: 'all',
    audience: 'all',
    timeRange: 'all',
    visibility: 'all'
  });
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const handleEditEntry = (entryId: string) => {
    setEditingEntryId(entryId);
  };

  const handleSaveEntry = async (updatedEntry: ChangelogEntry) => {
    try {
      const response = await fetch(`/api/changelog/${updatedEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEntry),
      });

      if (!response.ok) {
        throw new Error('Failed to update entry');
      }

      setEntries(prev => prev.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      ));
      setFilteredEntries(prev => prev.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      ));

      setEditingEntryId(null);
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingEntryId(null);
  };

  const handleFieldUpdate = (entryId: string, field: keyof ChangelogEntry, value: any) => {
    const updateEntry = (entries: ChangelogEntry[]) => 
      entries.map(entry => 
        entry.id === entryId ? { ...entry, [field]: value } : entry
      );
    
    setEntries(updateEntry);
    setFilteredEntries(updateEntry);
  };

  // Fetch changelog entries
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/changelog');
        
        if (!response.ok) {
          throw new Error('Failed to fetch changelog entries');
        }
        
        const data = await response.json();
        setEntries(data.entries || []);
        setFilteredEntries(data.entries || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load changelog');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...entries];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.content_title.toLowerCase().includes(query) ||
        entry.generated_content.toLowerCase().includes(query) ||
        entry.tldr_summary?.toLowerCase().includes(query)
      );
    }

    // Apply other filters
    if (filters.contentType !== 'all') {
      filtered = filtered.filter(entry => entry.content_type === filters.contentType);
    }
    if (filters.category !== 'all') {
      filtered = filtered.filter(entry => entry.update_category === filters.category);
    }
    if (filters.audience !== 'all') {
      filtered = filtered.filter(entry => entry.target_audience === filters.audience);
    }
    if (filters.visibility !== 'all') {
      if (filters.visibility === 'public') {
        filtered = filtered.filter(entry => entry.is_public === true);
      } else if (filters.visibility === 'private') {
        filtered = filtered.filter(entry => entry.is_public === false);
      }
    }

    // Apply time range filter
    if (filters.timeRange !== 'all') {
      const now = new Date();
      const timeRangeInDays = {
        '7d': 7,
        '30d': 30,
        '90d': 90
      };
      
      const days = timeRangeInDays[filters.timeRange as keyof typeof timeRangeInDays];
      if (days) {
        const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(entry => new Date(entry.published_at) >= cutoffDate);
      }
    }

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    setFilteredEntries(filtered);
  }, [entries, searchQuery, filters]);

  const getContentTypeIcon = (type: string) => {
    const icons = {
      'product_announcement': '📢',
      'feature_release': '✨',
      'bug_fix': '🐛',
      'security_update': '🔒',
      'performance_improvement': '⚡',
      'integration_update': '🔗',
      'changelog_entry': '📝',
      'customer_communication': '💬',
      'sales_enablement': '💼',
      'social_media_post': '📱'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'major_release': 'bg-purple-100 text-purple-800',
      'feature_update': 'bg-blue-100 text-blue-800',
      'bug_fix': 'bg-red-100 text-red-800',
      'security_update': 'bg-orange-100 text-orange-800',
      'performance_improvement': 'bg-green-100 text-green-800',
      'integration_update': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getImportanceIndicator = (score: number) => {
    if (score >= 0.8) return { icon: AlertCircle, label: 'High Impact', color: 'text-red-600' };
    if (score >= 0.6) return { icon: Star, label: 'Medium Impact', color: 'text-yellow-600' };
    return { icon: Zap, label: 'Low Impact', color: 'text-green-600' };
  };

  const handleToggleVisibility = async (entryId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/changelog/${entryId}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_public: isPublic }),
      });

      if (!response.ok) {
        throw new Error('Failed to update visibility');
      }

      const updateVisibility = (entries: ChangelogEntry[]) => 
        entries.map(entry => 
          entry.id === entryId ? { ...entry, is_public: isPublic } : entry
        );

      setEntries(updateVisibility);
      setFilteredEntries(updateVisibility);
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading changelog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Changelog</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 pt-6">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Product Changelog</h1>
            <p className="text-base text-gray-600">Track all product updates and announcements</p>
          </div>

          {/* Filters Bar */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search updates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex flex-wrap gap-3">
                {/* Content Type Filter */}
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <select
                    value={filters.contentType}
                    onChange={(e) => setFilters({...filters, contentType: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="product_announcement">Product Announcements</option>
                    <option value="feature_release">Feature Releases</option>
                    <option value="bug_fix">Bug Fixes</option>
                    <option value="security_update">Security Updates</option>
                    <option value="performance_improvement">Performance Improvements</option>
                    <option value="integration_update">Integration Updates</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="major_release">Major Release</option>
                    <option value="feature_update">Feature Update</option>
                    <option value="bug_fix">Bug Fix</option>
                    <option value="security_update">Security Update</option>
                    <option value="performance_improvement">Performance Improvement</option>
                    <option value="integration_update">Integration Update</option>
                  </select>
                </div>

                {/* Time Range Filter */}
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <select
                    value={filters.timeRange}
                    onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                </div>

                {/* Visibility Filter */}
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-gray-600" />
                  <select
                    value={filters.visibility}
                    onChange={(e) => setFilters({...filters, visibility: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                  >
                    <option value="all">All Updates</option>
                    <option value="public">Public Only</option>
                    <option value="private">Private Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-xl p-3 inline-flex items-center">
              <span className="font-medium">{filteredEntries.length}</span> updates found
            </div>
          </div>

          {/* Main Content */}
          <div>
              {filteredEntries.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-12 text-center">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No updates found</h3>
                  <p className="text-gray-600">
                    {searchQuery ? `No updates found for "${searchQuery}". Try a different search term.` : 'Try adjusting your filters to see more updates.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredEntries.map((entry) => {
                    const importance = getImportanceIndicator(entry.importance_score || 0.5);
                    const ImportanceIcon = importance.icon;
                    
                    return (
                      <div
                        key={entry.id}
                        className={`bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all duration-200 ${
                          editingEntryId === entry.id ? 'border-2 border-blue-300' : 'border-gray-200/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {editingEntryId === entry.id ? (
                                <input
                                  type="text"
                                  value={entry.content_title}
                                  onChange={(e) => handleFieldUpdate(entry.id, 'content_title', e.target.value)}
                                  className="text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              ) : (
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {entry.content_title}
                                </h3>
                              )}
                              {entry.breaking_changes && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Breaking Change
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 mb-3">
                              {editingEntryId === entry.id ? (
                                <select
                                  value={entry.update_category || 'feature_update'}
                                  onChange={(e) => handleFieldUpdate(entry.id, 'update_category', e.target.value)}
                                  className="px-3 py-1 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="major_release">Major Release</option>
                                  <option value="feature_update">Feature Update</option>
                                  <option value="bug_fix">Bug Fix</option>
                                  <option value="security_update">Security Update</option>
                                  <option value="performance_improvement">Performance Improvement</option>
                                  <option value="integration_update">Integration Update</option>
                                </select>
                              ) : (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(entry.update_category || 'feature_update')}`}>
                                  {entry.update_category?.replace('_', ' ') || 'Feature Update'}
                                </span>
                              )}
                              
                              {editingEntryId === entry.id ? (
                                <select
                                  value={entry.importance_score && entry.importance_score >= 0.8 ? 'high' : entry.importance_score && entry.importance_score >= 0.6 ? 'medium' : 'low'}
                                  onChange={(e) => {
                                    const score = e.target.value === 'high' ? 0.9 : e.target.value === 'medium' ? 0.7 : 0.5;
                                    handleFieldUpdate(entry.id, 'importance_score', score);
                                  }}
                                  className="px-3 py-1 border border-gray-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="high">High Impact</option>
                                  <option value="medium">Medium Impact</option>
                                  <option value="low">Low Impact</option>
                                </select>
                              ) : (
                                <span className={`inline-flex items-center text-sm ${importance.color}`}>
                                  <ImportanceIcon className="w-4 h-4 mr-1" />
                                  {importance.label}
                                </span>
                              )}
                              
                              <span className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(entry.published_at), { addSuffix: true })}
                              </span>
                            </div>

                            {(entry.tldr_summary || editingEntryId === entry.id) && (
                              <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                                <h4 className="text-sm font-medium text-blue-900 mb-1">TL;DR</h4>
                                {editingEntryId === entry.id ? (
                                  <textarea
                                    value={entry.tldr_summary || ''}
                                    onChange={(e) => handleFieldUpdate(entry.id, 'tldr_summary', e.target.value)}
                                    className="w-full text-sm text-blue-800 bg-white border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    rows={2}
                                    placeholder="Add TL;DR summary..."
                                  />
                                ) : (
                                  <p className="text-sm text-blue-800">{entry.tldr_summary}</p>
                                )}
                              </div>
                            )}

                            {entry.tldr_bullet_points && entry.tldr_bullet_points.length > 0 && (
                              <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Key Points:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                  {entry.tldr_bullet_points.map((point, index) => (
                                    <li key={index} className="text-sm text-gray-700">{point}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="prose prose-sm max-w-none text-gray-700">
                              {editingEntryId === entry.id ? (
                                <textarea
                                  value={entry.generated_content}
                                  onChange={(e) => handleFieldUpdate(entry.id, 'generated_content', e.target.value)}
                                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 resize-none"
                                  rows={6}
                                  placeholder="Enter content..."
                                />
                              ) : (
                                <div className="whitespace-pre-wrap">{entry.generated_content}</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 ml-4">
                            {/* Edit Button */}
                            {editingEntryId === entry.id ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleSaveEntry(entry)}
                                  className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200 rounded-xl transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                  <span className="text-xs font-medium">Save</span>
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="flex items-center space-x-2 px-3 py-1 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-xl transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                  <span className="text-xs font-medium">Cancel</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEditEntry(entry.id)}
                                className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-xl transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                                <span className="text-xs font-medium">Edit</span>
                              </button>
                            )}

                            {/* Public Visibility Toggle */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleToggleVisibility(entry.id, !entry.is_public)}
                                className={`flex items-center space-x-2 px-3 py-1 rounded-xl transition-colors ${
                                  entry.is_public 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                }`}
                              >
                                {entry.is_public ? (
                                  <Eye className="w-4 h-4" />
                                ) : (
                                  <EyeOff className="w-4 h-4" />
                                )}
                                <span className="text-xs font-medium">
                                  {entry.is_public ? 'Public' : 'Private'}
                                </span>
                              </button>
                            </div>
                            
                            {/* Quality Score */}
                            <div className="text-center">
                              <div className="text-sm text-gray-500">Quality</div>
                              <div className="flex items-center space-x-2">
                                <div className="text-lg font-semibold text-gray-900">
                                  {(entry.quality_score * 100).toFixed(0)}%
                                </div>
                                <div className={`w-3 h-3 rounded-full ${
                                  entry.quality_score >= 0.8 ? 'bg-green-500' :
                                  entry.quality_score >= 0.6 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}