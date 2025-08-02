'use client';

import { useState, useEffect } from 'react';
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
  version: string;
  release_date: string;
  category: 'Added' | 'Fixed' | 'Improved' | 'Deprecated' | 'Security';
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
      // In production, integrate with email service
      console.log('Subscribe email:', subscribedEmail);
      alert('Successfully subscribed to changelog updates!');
      setSubscribedEmail('');
    } catch (error) {
      console.error('Failed to subscribe:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Added': return 'bg-green-100 text-green-800 border-green-300';
      case 'Improved': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Fixed': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Security': return 'bg-red-100 text-red-800 border-red-300';
      case 'Deprecated': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
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
    if (!searchQuery) return true;
    
    return (
      entry.customer_facing_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.customer_facing_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.highlights.some(highlight => 
        highlight.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product updates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public Header with Registration Option */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CI</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Customer Intelligence</h2>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="/register"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Create Account
              </a>
              <a
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Sign In
              </a>
            </div>
          </div>
          
          {/* Main Header */}
          <div className="py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Product Changelog</h1>
              <p className="text-xl text-gray-600 mb-6">
                Stay updated with our latest features, improvements, and fixes
              </p>
              
              {/* Subscribe to Updates */}
              <div className="flex items-center justify-center space-x-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={subscribedEmail}
                  onChange={(e) => setSubscribedEmail(e.target.value)}
                  placeholder="Enter email for updates"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleSubscribe}
                  disabled={isSubscribing || !subscribedEmail.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Subscribe</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search updates..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex space-x-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="Added">🆕 Added</option>
                <option value="Improved">⚡ Improved</option>
                <option value="Fixed">🔧 Fixed</option>
                <option value="Security">🔒 Security</option>
                <option value="Deprecated">⚠️ Deprecated</option>
              </select>

              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 3 months</option>
                <option value="365d">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Changelog Entries */}
        <div className="space-y-6">
          {filteredEntries.map((entry) => {
            const isExpanded = expandedEntries.has(entry.id);
            
            return (
              <div
                key={entry.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Entry Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getCategoryIcon(entry.category)}</div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h2 className="text-xl font-semibold text-gray-900">
                            {entry.customer_facing_title}
                          </h2>
                          <span className="text-sm font-medium text-gray-500">
                            {entry.version}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {formatDistanceToNow(new Date(entry.release_date), { addSuffix: true })}
                            </span>
                          </div>
                          {entry.affected_users && (
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>
                                {entry.affected_users.toLocaleString()} users affected
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(entry.category)}`}>
                        {entry.category}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {entry.customer_facing_description}
                  </p>

                  {/* Highlights Preview */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">What's New:</h3>
                    <ul className="space-y-1">
                      {entry.highlights.slice(0, isExpanded ? entry.highlights.length : 3).map((highlight, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {entry.highlights.length > 3 && !isExpanded && (
                      <button
                        onClick={() => toggleExpanded(entry.id)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <span>Show {entry.highlights.length - 3} more</span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Breaking Changes & Migration Notes */}
                  {isExpanded && entry.breaking_changes && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <h4 className="text-sm font-medium text-red-900 mb-1 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>Breaking Changes</span>
                      </h4>
                      <p className="text-sm text-red-700">
                        This update includes breaking changes that may affect your integration.
                      </p>
                      {entry.migration_notes && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-red-900">Migration Notes:</p>
                          <p className="text-sm text-red-700">{entry.migration_notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span>{entry.view_count.toLocaleString()}</span>
                      </div>
                      
                      <button
                        onClick={() => handleUpvote(entry.id)}
                        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{entry.upvotes}</span>
                      </button>
                      
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <MessageSquare className="w-4 h-4" />
                        <span>{entry.feedback_count}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isExpanded && (
                        <button
                          onClick={() => toggleExpanded(entry.id)}
                          className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                        >
                          <span>Show less</span>
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => navigator.clipboard.writeText(window.location.href + '#' + entry.id)}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                      >
                        <Share className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No updates found</h3>
            <p className="text-gray-600">
              {searchQuery || categoryFilter !== 'all' || timeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Check back soon for the latest product updates'}
            </p>
          </div>
        )}

        {/* RSS Feed Link */}
        <div className="text-center py-8">
          <a
            href="/api/public-changelog?format=rss"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Subscribe to RSS Feed</span>
          </a>
        </div>
      </div>
    </div>
  );
}