'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek, isThisMonth, isThisYear } from 'date-fns';

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
}

interface FilterOptions {
  contentType: string;
  category: string;
  audience: string;
  timeRange: string;
}

interface GroupedEntries {
  [key: string]: ChangelogEntry[];
}

interface ViewOptions {
  groupBy: 'date' | 'category' | 'importance';
  sortOrder: 'newest' | 'oldest';
  showTimeline: boolean;
}

interface SearchState {
  query: string;
  isActive: boolean;
  results: ChangelogEntry[];
  totalResults: number;
  searchFields: string[];
}

export default function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    contentType: 'all',
    category: 'all',
    audience: 'all',
    timeRange: 'all'
  });
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    groupBy: 'date',
    sortOrder: 'newest',
    showTimeline: true
  });
  const [groupedEntries, setGroupedEntries] = useState<GroupedEntries>({});
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    isActive: false,
    results: [],
    totalResults: 0,
    searchFields: ['content_title', 'generated_content', 'tldr_summary']
  });

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

  // Apply filters
  useEffect(() => {
    let filtered = [...entries];

    // Filter by content type
    if (filters.contentType !== 'all') {
      filtered = filtered.filter(entry => entry.content_type === filters.contentType);
    }

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(entry => entry.update_category === filters.category);
    }

    // Filter by audience
    if (filters.audience !== 'all') {
      filtered = filtered.filter(entry => entry.target_audience === filters.audience);
    }

    // Filter by time range
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

    // Sort by published date based on view options
    if (viewOptions.sortOrder === 'newest') {
      filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    } else {
      filtered.sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime());
    }

    setFilteredEntries(filtered);
  }, [entries, filters, viewOptions.sortOrder]);

  // Group entries for chronological organization
  useEffect(() => {
    const grouped: GroupedEntries = {};

    filteredEntries.forEach(entry => {
      let groupKey: string;
      
      switch (viewOptions.groupBy) {
        case 'date':
          groupKey = getDateGroup(entry.published_at);
          break;
        case 'category':
          groupKey = entry.update_category || 'uncategorized';
          break;
        case 'importance':
          groupKey = getImportanceGroup(entry.importance_score || 0.5);
          break;
        default:
          groupKey = 'all';
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(entry);
    });

    setGroupedEntries(grouped);
  }, [filteredEntries, viewOptions.groupBy]);

  // Search functionality
  useEffect(() => {
    if (!searchState.query.trim()) {
      setSearchState(prev => ({
        ...prev,
        isActive: false,
        results: [],
        totalResults: 0
      }));
      return;
    }

    const query = searchState.query.toLowerCase();
    const searchResults = entries.filter(entry => {
      return searchState.searchFields.some(field => {
        const value = entry[field as keyof ChangelogEntry];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query);
        }
        if (Array.isArray(value)) {
          return value.some(item => 
            typeof item === 'string' && item.toLowerCase().includes(query)
          );
        }
        return false;
      });
    });

    setSearchState(prev => ({
      ...prev,
      isActive: true,
      results: searchResults,
      totalResults: searchResults.length
    }));
  }, [searchState.query, searchState.searchFields, entries]);

  // Keyboard shortcuts for search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.getElementById('search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      // Escape to clear search
      if (event.key === 'Escape' && searchState.isActive) {
        setSearchState(prev => ({
          ...prev,
          query: '',
          isActive: false,
          results: [],
          totalResults: 0
        }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchState.isActive]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

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
      'major_release': 'bg-purple-100 text-purple-800 border-purple-200',
      'feature_update': 'bg-blue-100 text-blue-800 border-blue-200',
      'bug_fix': 'bg-red-100 text-red-800 border-red-200',
      'security_update': 'bg-orange-100 text-orange-800 border-orange-200',
      'performance_improvement': 'bg-green-100 text-green-800 border-green-200',
      'integration_update': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getImportanceIndicator = (score: number) => {
    if (score >= 0.8) return { icon: '🔥', label: 'High Impact', color: 'text-red-600' };
    if (score >= 0.6) return { icon: '📈', label: 'Medium Impact', color: 'text-yellow-600' };
    return { icon: '📊', label: 'Low Impact', color: 'text-green-600' };
  };

  const getDateGroup = (publishedAt: string) => {
    const date = new Date(publishedAt);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isThisWeek(date)) {
      return 'This Week';
    } else if (isThisMonth(date)) {
      return 'This Month';
    } else if (isThisYear(date)) {
      return format(date, 'MMMM yyyy');
    } else {
      return format(date, 'yyyy');
    }
  };

  const getImportanceGroup = (score: number) => {
    if (score >= 0.8) return 'High Impact';
    if (score >= 0.6) return 'Medium Impact';
    return 'Low Impact';
  };

  const getGroupIcon = (groupKey: string, groupBy: string) => {
    if (groupBy === 'date') {
      if (groupKey === 'Today') return '📅';
      if (groupKey === 'Yesterday') return '📆';
      if (groupKey === 'This Week') return '🗓️';
      if (groupKey === 'This Month') return '🗓️';
      return '🗓️';
    } else if (groupBy === 'category') {
      return getContentTypeIcon(groupKey);
    } else if (groupBy === 'importance') {
      if (groupKey === 'High Impact') return '🔥';
      if (groupKey === 'Medium Impact') return '📈';
      return '📊';
    }
    return '📋';
  };

  const getGroupOrder = (groupBy: string) => {
    if (groupBy === 'date') {
      return ['Today', 'Yesterday', 'This Week', 'This Month'];
    } else if (groupBy === 'importance') {
      return ['High Impact', 'Medium Impact', 'Low Impact'];
    }
    return [];
  };

  const getSortedGroupKeys = (groupedEntries: GroupedEntries, groupBy: string) => {
    const keys = Object.keys(groupedEntries);
    const priorityOrder = getGroupOrder(groupBy);
    
    // Sort keys based on priority order, then alphabetically
    return keys.sort((a, b) => {
      const aIndex = priorityOrder.indexOf(a);
      const bIndex = priorityOrder.indexOf(b);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      } else if (aIndex !== -1) {
        return -1;
      } else if (bIndex !== -1) {
        return 1;
      } else {
        return a.localeCompare(b);
      }
    });
  };

  const highlightSearchTerm = (text: string, query: string) => {
    if (!query.trim() || !searchState.isActive) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return `<mark class="bg-yellow-200 px-1 rounded">${part}</mark>`;
      }
      return part;
    }).join('');
  };

  const getDisplayEntries = () => {
    return searchState.isActive ? searchState.results : filteredEntries;
  };

  const getDisplayGroupedEntries = () => {
    if (!searchState.isActive) return groupedEntries;
    
    // Re-group search results
    const searchGrouped: GroupedEntries = {};
    searchState.results.forEach(entry => {
      let groupKey: string;
      
      switch (viewOptions.groupBy) {
        case 'date':
          groupKey = getDateGroup(entry.published_at);
          break;
        case 'category':
          groupKey = entry.update_category || 'uncategorized';
          break;
        case 'importance':
          groupKey = getImportanceGroup(entry.importance_score || 0.5);
          break;
        default:
          groupKey = 'all';
      }

      if (!searchGrouped[groupKey]) {
        searchGrouped[groupKey] = [];
      }
      searchGrouped[groupKey].push(entry);
    });
    
    return searchGrouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading changelog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Product Updates</h1>
                <p className="mt-2 text-gray-600">
                  Stay up to date with the latest product improvements and releases
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {searchState.isActive ? (
                    <>
                      {searchState.totalResults} {searchState.totalResults === 1 ? 'result' : 'results'} for "{searchState.query}"
                    </>
                  ) : (
                    <>
                      {getDisplayEntries().length} {getDisplayEntries().length === 1 ? 'update' : 'updates'}
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="search-input"
                type="text"
                placeholder="Search updates... (⌘K)"
                value={searchState.query}
                onChange={(e) => setSearchState(prev => ({ ...prev, query: e.target.value }))}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              {searchState.query && (
                <button
                  onClick={() => setSearchState(prev => ({ ...prev, query: '', isActive: false, results: [], totalResults: 0 }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            {searchState.isActive && (
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                <span>
                  Found {searchState.totalResults} {searchState.totalResults === 1 ? 'result' : 'results'}
                </span>
                <div className="flex items-center space-x-2">
                  <span>Search in:</span>
                  <div className="flex items-center space-x-2">
                    {[
                      { key: 'content_title', label: 'Titles' },
                      { key: 'generated_content', label: 'Content' },
                      { key: 'tldr_summary', label: 'Summaries' }
                    ].map(field => (
                      <label key={field.key} className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={searchState.searchFields.includes(field.key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSearchState(prev => ({
                                ...prev,
                                searchFields: [...prev.searchFields, field.key]
                              }));
                            } else {
                              setSearchState(prev => ({
                                ...prev,
                                searchFields: prev.searchFields.filter(f => f !== field.key)
                              }));
                            }
                          }}
                          className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-xs">{field.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">View Options</h3>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Group by:</label>
                <select
                  value={viewOptions.groupBy}
                  onChange={(e) => setViewOptions(prev => ({ ...prev, groupBy: e.target.value as 'date' | 'category' | 'importance' }))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="category">Category</option>
                  <option value="importance">Importance</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sort:</label>
                <select
                  value={viewOptions.sortOrder}
                  onChange={(e) => setViewOptions(prev => ({ ...prev, sortOrder: e.target.value as 'newest' | 'oldest' }))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={viewOptions.showTimeline}
                    onChange={(e) => setViewOptions(prev => ({ ...prev, showTimeline: e.target.checked }))}
                    className="mr-2"
                  />
                  Show Timeline
                </label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={filters.contentType}
                onChange={(e) => handleFilterChange('contentType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audience
              </label>
              <select
                value={filters.audience}
                onChange={(e) => handleFilterChange('audience', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Audiences</option>
                <option value="customers">Customers</option>
                <option value="prospects">Prospects</option>
                <option value="internal_team">Internal Team</option>
                <option value="media">Media</option>
                <option value="executives">Executives</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select
                value={filters.timeRange}
                onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Changelog Entries */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {getDisplayEntries().length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No updates found</h3>
            <p className="text-gray-600">
              {searchState.isActive 
                ? `No updates found for "${searchState.query}". Try a different search term.`
                : entries.length === 0 
                  ? "No product updates have been published yet." 
                  : "Try adjusting your filters to see more updates."
              }
            </p>
          </div>
        ) : (
          <div className={`${viewOptions.showTimeline ? 'relative' : ''}`}>
            {/* Timeline Line */}
            {viewOptions.showTimeline && viewOptions.groupBy === 'date' && (
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            )}
            
            {getSortedGroupKeys(getDisplayGroupedEntries(), viewOptions.groupBy).map((groupKey) => (
              <div key={groupKey} className="mb-8">
                {/* Group Header */}
                <div className={`flex items-center mb-6 ${viewOptions.showTimeline && viewOptions.groupBy === 'date' ? 'relative' : ''}`}>
                  {viewOptions.showTimeline && viewOptions.groupBy === 'date' && (
                    <div className="absolute left-8 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  )}
                  <div className={`flex items-center space-x-3 ${viewOptions.showTimeline && viewOptions.groupBy === 'date' ? 'ml-16' : ''}`}>
                    <div className="text-2xl">
                      {getGroupIcon(groupKey, viewOptions.groupBy)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{groupKey}</h2>
                      <p className="text-sm text-gray-500">
                        {getDisplayGroupedEntries()[groupKey].length} {getDisplayGroupedEntries()[groupKey].length === 1 ? 'update' : 'updates'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Group Entries */}
                <div className={`space-y-6 ${viewOptions.showTimeline && viewOptions.groupBy === 'date' ? 'ml-16' : ''}`}>
                  {getDisplayGroupedEntries()[groupKey].map((entry) => {
                    const importance = getImportanceIndicator(entry.importance_score || 0.5);
                    
                    return (
                      <div
                        key={entry.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="text-2xl">
                                {getContentTypeIcon(entry.content_type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-xl font-semibold text-gray-900">
                                    <span 
                                      dangerouslySetInnerHTML={{
                                        __html: highlightSearchTerm(entry.content_title, searchState.query)
                                      }}
                                    />
                                  </h3>
                                  {entry.breaking_changes && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                      Breaking Change
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-4 mb-3">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(entry.update_category || 'feature_update')}`}>
                                    {entry.update_category?.replace('_', ' ') || 'Feature Update'}
                                  </span>
                                  <span className={`inline-flex items-center text-sm ${importance.color}`}>
                                    <span className="mr-1">{importance.icon}</span>
                                    {importance.label}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {formatDistanceToNow(new Date(entry.published_at), { addSuffix: true })}
                                  </span>
                                  {viewOptions.groupBy !== 'date' && (
                                    <span className="text-sm text-gray-500">
                                      • {format(new Date(entry.published_at), 'MMM d, yyyy')}
                                    </span>
                                  )}
                                </div>

                                {entry.tldr_summary && (
                                  <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                                    <h4 className="text-sm font-medium text-blue-900 mb-1">TL;DR</h4>
                                    <p className="text-sm text-blue-800">
                                      <span 
                                        dangerouslySetInnerHTML={{
                                          __html: highlightSearchTerm(entry.tldr_summary, searchState.query)
                                        }}
                                      />
                                    </p>
                                  </div>
                                )}

                                {entry.tldr_bullet_points && entry.tldr_bullet_points.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Key Points:</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                      {entry.tldr_bullet_points.map((point, index) => (
                                        <li key={index} className="text-sm text-gray-700">{point}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                <div className="prose prose-sm max-w-none text-gray-700">
                                  {entry.generated_content && (
                                    <div className="whitespace-pre-wrap">
                                      <span 
                                        dangerouslySetInnerHTML={{
                                          __html: highlightSearchTerm(entry.generated_content, searchState.query)
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <div className="text-right">
                                <div className="text-sm text-gray-500">Quality Score</div>
                                <div className="text-lg font-semibold text-gray-900">
                                  {(entry.quality_score * 100).toFixed(0)}%
                                </div>
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
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}