'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { 
  Search,
  Filter,
  ExternalLink,
  Star,
  Eye,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  Share,
  ThumbsUp,
  Bell
} from 'lucide-react';

interface PublicChangelogEntry {
  id: string;
  version?: string;
  release_date: string;
  category: 'Added' | 'Fixed' | 'Improved' | 'Deprecated' | 'Security';
  tags: string[];
  customer_facing_title: string;
  customer_facing_description: string;
  highlights: string[];
  breaking_changes: boolean;
  migration_notes?: string;
  affected_users?: number;
  view_count: number;
  upvotes: number;
  feedback_count: number;
  jira_story_key?: string;
  external_link?: string;
  video_url?: string;
  image_url?: string;
}

export default function PublicChangelogPage() {
  const [entries, setEntries] = useState<PublicChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchChangelog();
  }, [categoryFilter, timeFilter]);

  const fetchChangelog = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (timeFilter !== 'all') params.append('timeframe', timeFilter);
      
      const response = await fetch(`/api/public-changelog?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setEntries(data.changelog);
      }
    } catch (error) {
      console.error('Failed to fetch changelog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (entryId: string) => {
    try {
      await fetch('/api/public-changelog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upvote', entryId })
      });
      
      // Update local state
      setEntries(prev => prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, upvotes: entry.upvotes + 1 }
          : entry
      ));
    } catch (error) {
      console.error('Failed to upvote:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!subscribedEmail.trim()) return;
    
    try {
      setIsSubscribing(true);
      
      const response = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: subscribedEmail,
          preferences: {
            categories: ['Added', 'Improved', 'Fixed'],
            tags: [],
            frequency: 'weekly'
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Successfully subscribed to changelog updates!');
        setSubscribedEmail('');
      } else {
        alert(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Added': return 'bg-green-100 text-green-800 border border-green-200';
      case 'Improved': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Fixed': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Security': return 'bg-red-100 text-red-800 border border-red-200';
      case 'Deprecated': return 'bg-orange-100 text-orange-800 border border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getTagOptions = () => [
    'Announcement',
    'Bug fix', 
    'Improvement',
    'New feature',
    'Developers',
    'Convert',
    'AI Agent',
    'Performance',
    'Integration',
    'UI/UX',
    'API',
    'Mobile',
    'Enterprise'
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Added': return '🆕';
      case 'Improved': return '⚡';
      case 'Fixed': return '🔧';
      case 'Security': return '🔒';
      case 'Deprecated': return '⚠️';
      default: return '📝';
    }
  };

  const toggleExpanded = (entryId: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const filteredEntries = entries.filter(entry => {
    // Search filter
    if (searchQuery) {
      const matchesSearch = (
        entry.customer_facing_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.customer_facing_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.version || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.highlights.some(highlight => 
          highlight.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      if (!matchesSearch) return false;
    }
    
    // Date range filter
    if (selectedDateRange !== 'all') {
      const entryDate = new Date(entry.release_date);
      const year = entryDate.getFullYear();
      const month = entryDate.getMonth() + 1;
      
      if (selectedDateRange === '2025-08') {
        if (year !== 2025 || month !== 8) return false;
      } else if (selectedDateRange === '2025-07') {
        if (year !== 2025 || month !== 7) return false;
      } else if (selectedDateRange === '2025-06') {
        if (year !== 2025 || month !== 6) return false;
      } else if (selectedDateRange === '2025-05') {
        if (year !== 2025 || month !== 5) return false;
      } else if (selectedDateRange === '2025-04') {
        if (year !== 2025 || month !== 4) return false;
      } else if (selectedDateRange === '2025-03') {
        if (year !== 2025 || month !== 3) return false;
      }
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      if (entry.category !== categoryFilter) return false;
    }
    
    // Tag filter
    if (selectedTags.size > 0) {
      const hasMatchingTag = entry.tags?.some(tag => selectedTags.has(tag));
      if (!hasMatchingTag) return false;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Marq product updates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Marq Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-8">
              {/* Simple Marq Reference */}
              <div className="flex items-center">
                <div className="text-3xl font-bold text-gray-900">
                  marq
                </div>
              </div>
              <nav className="flex items-center space-x-6">
                <Link 
                  href="/blog"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Blog
                </Link>
                <span className="text-gray-900 font-medium">Product Updates</span>
              </nav>
            </div>
          </div>
          
          {/* Compact Header */}
          <div className="py-12 text-center border-b border-gray-100">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">What's New</h1>
            <p className="text-base text-gray-600 max-w-2xl mx-auto mb-6">
              The latest updates and improvements to the Marq platform.
            </p>
            
            {/* Subscribe Section - Minimal */}
            <div className="inline-flex items-center space-x-3">
              <input
                type="email"
                value={subscribedEmail}
                onChange={(e) => setSubscribedEmail(e.target.value)}
                placeholder="Your email"
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-64"
              />
              <button
                onClick={handleSubscribe}
                disabled={isSubscribing || !subscribedEmail.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Only Filters */}
      <div className="lg:hidden max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search updates..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          
          {/* Mobile Filters */}
          <div className="flex space-x-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="all">All categories</option>
              <option value="Added">New features</option>
              <option value="Improved">Improvements</option>
              <option value="Fixed">Bug fixes</option>
            </select>

            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="all">All time</option>
              <option value="2025-08">August 2025</option>
              <option value="2025-07">July 2025</option>
              <option value="2025-06">June 2025</option>
              <option value="2025-05">May 2025</option>
              <option value="2025-04">April 2025</option>
              <option value="2025-03">March 2025</option>
            </select>
          </div>

          {/* Mobile Tag Selection */}
          {selectedTags.size > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Tags:</span>
              {Array.from(selectedTags).map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {tag} ×
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Desktop Search Bar */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0"></div> {/* Spacer for sidebar */}
          <div className="flex-1">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search updates..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex gap-8">
          {/* Left Sidebar - Date Navigation */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Browse by Date</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedDateRange('all')}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedDateRange === 'all'
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  All Updates
                </button>
                <button
                  onClick={() => setSelectedDateRange('2025-08')}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedDateRange === '2025-08'
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  August 2025
                </button>
                <button
                  onClick={() => setSelectedDateRange('2025-07')}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedDateRange === '2025-07'
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  July 2025
                </button>
                <button
                  onClick={() => setSelectedDateRange('2025-06')}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedDateRange === '2025-06'
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  June 2025
                </button>
                <button
                  onClick={() => setSelectedDateRange('2025-05')}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedDateRange === '2025-05'
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  May 2025
                </button>
                <button
                  onClick={() => setSelectedDateRange('2025-04')}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedDateRange === '2025-04'
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  April 2025
                </button>
                <button
                  onClick={() => setSelectedDateRange('2025-03')}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedDateRange === '2025-03'
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  March 2025
                </button>
              </div>
              
              {/* Categories in Sidebar */}
              <h3 className="text-sm font-semibold text-gray-900 mb-4 mt-8">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    categoryFilter === 'all'
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                <button
                  onClick={() => setCategoryFilter('Added')}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    categoryFilter === 'Added'
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  New Features
                </button>
                <button
                  onClick={() => setCategoryFilter('Improved')}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    categoryFilter === 'Improved'
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Improvements
                </button>
                <button
                  onClick={() => setCategoryFilter('Fixed')}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    categoryFilter === 'Fixed'
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Bug Fixes
                </button>
              </div>
              
              {/* Tags Section */}
              <h3 className="text-sm font-semibold text-gray-900 mb-4 mt-8">Filter by Tags</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {getTagOptions().map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      selectedTags.has(tag)
                        ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span>{tag}</span>
                      {selectedTags.has(tag) && <span className="text-blue-600">✓</span>}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* Clear Tags Button */}
              {selectedTags.size > 0 && (
                <button
                  onClick={() => setSelectedTags(new Set())}
                  className="mt-3 text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all tags ({selectedTags.size})
                </button>
              )}
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
        {/* Changelog Entries */}
        <div className="space-y-12">
          {filteredEntries.map((entry) => {
            const isExpanded = expandedEntries.has(entry.id);
            
            return (
              <article
                key={entry.id}
                className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-200 mb-8"
              >
                {/* Date Header */}
                <div className="mb-6">
                  <time className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border">
                    {new Date(entry.release_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </time>
                </div>

                {/* Entry Content */}
                <div className="space-y-4">
                  {/* Title and Tags */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4 leading-tight">
                        {entry.customer_facing_title}
                      </h2>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getCategoryColor(entry.category)}`}>
                          {entry.category}
                        </span>
                        {entry.tags && entry.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed text-base">
                      {entry.customer_facing_description}
                    </p>
                  </div>

                  {/* Media Content */}
                  {(entry.image_url || entry.video_url || entry.external_link) && (
                    <div className="mb-4">
                      {/* Image */}
                      {entry.image_url && (
                        <div className="mb-4">
                          <img 
                            src={entry.image_url} 
                            alt={entry.customer_facing_title}
                            className="rounded-lg border border-gray-200 max-w-full h-auto"
                            loading="lazy"
                          />
                        </div>
                      )}
                      
                      {/* Video */}
                      {entry.video_url && (
                        <div className="mb-4">
                          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            {entry.video_url.includes('youtube.com') || entry.video_url.includes('youtu.be') ? (
                              <iframe
                                src={entry.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                title={entry.customer_facing_title}
                                className="absolute inset-0 w-full h-full"
                                frameBorder="0"
                                allowFullScreen
                              />
                            ) : (
                              <video 
                                controls 
                                className="absolute inset-0 w-full h-full object-cover"
                                poster={entry.image_url}
                              >
                                <source src={entry.video_url} />
                                Your browser does not support video playback.
                              </video>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* External Link */}
                      {entry.external_link && (
                        <div className="mb-4">
                          <a 
                            href={entry.external_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Learn more</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Highlights */}
                  {entry.highlights.length > 0 && (
                    <div className="">
                      <ul className="space-y-2">
                        {entry.highlights.slice(0, isExpanded ? entry.highlights.length : 3).map((highlight, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-indigo-600 mt-1.5">•</span>
                            <span className="text-gray-700 text-sm">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {entry.highlights.length > 3 && !isExpanded && (
                        <button
                          onClick={() => toggleExpanded(entry.id)}
                          className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Show {entry.highlights.length - 3} more
                        </button>
                      )}
                    </div>
                  )}

                  {/* Breaking Changes */}
                  {isExpanded && entry.breaking_changes && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-amber-900">Breaking Changes</h4>
                          <p className="text-sm text-amber-800 mt-1">
                            This update includes changes that may require action.
                          </p>
                          {entry.migration_notes && (
                            <p className="text-sm text-amber-800 mt-2">{entry.migration_notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Simple Footer Actions */}
                  <div className="flex items-center justify-between pt-4">
                    <button
                      onClick={() => {
                        const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/public-changelog#${entry.id}`;
                        navigator.clipboard.writeText(url);
                        // Simple feedback - could enhance with toast notification
                        const button = document.activeElement as HTMLButtonElement;
                        const originalText = button.textContent;
                        button.textContent = 'Copied!';
                        setTimeout(() => {
                          button.textContent = originalText;
                        }, 2000);
                      }}
                      className="text-sm text-gray-500 hover:text-indigo-600 transition-colors flex items-center space-x-1"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy link</span>
                    </button>
                    
                    {isExpanded && (
                      <button
                        onClick={() => toggleExpanded(entry.id)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Show less
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
          </div>
          {/* Empty State */}
        {filteredEntries.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No updates found</h3>
            <p className="text-gray-600">
              {searchQuery || categoryFilter !== 'all' || selectedDateRange !== 'all' || selectedTags.size > 0
                ? 'Try adjusting your search, filters, or selected tags'
                : 'Check back soon for new updates'}
            </p>
          </div>
        )}

          {/* RSS Feed Link */}
          <div className="text-center py-8 border-t border-gray-100">
            <a
              href="/api/public-changelog?format=rss"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
            >
              RSS Feed
            </a>
          </div>
        </div>
      </div>
    </div>

      {/* Simple Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">marq</div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Marq. Product updates and changelog.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}