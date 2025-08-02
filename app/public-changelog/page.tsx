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
      case 'Added': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Improved': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Fixed': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Security': return 'bg-red-50 text-red-700 border-red-200';
      case 'Deprecated': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
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
              {/* Marq Logo */}
              <div className="flex items-center">
                <svg width="80" height="24" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 4.8V19.2H4.8V12.48L8.64 19.2H14.4L9.12 11.04L14.4 4.8H8.64L4.8 10.32V4.8H0Z" fill="#6366F1"/>
                  <path d="M16.8 4.8V19.2H21.6V16.32H26.4V12.48H21.6V8.64H28.8V4.8H16.8Z" fill="#6366F1"/>
                  <path d="M31.2 4.8V19.2H36V15.36L38.4 19.2H43.2L39.6 13.44L43.2 4.8H38.4L36 10.08V4.8H31.2Z" fill="#6366F1"/>
                  <path d="M52.8 4.8C49.44 4.8 46.8 7.44 46.8 12S49.44 19.2 52.8 19.2S58.8 16.56 58.8 12S56.16 4.8 52.8 4.8ZM52.8 15.36C51.84 15.36 51.6 14.4 51.6 12S51.84 8.64 52.8 8.64S54 9.6 54 12S53.76 15.36 52.8 15.36Z" fill="#6366F1"/>
                </svg>
              </div>
              
              {/* Navigation Links */}
              <nav className="hidden md:flex items-center space-x-8">
                <a href="https://www.marq.com" className="text-gray-700 hover:text-indigo-600 text-sm font-medium transition-colors">Home</a>
                <a href="https://www.marq.com/blog" className="text-gray-700 hover:text-indigo-600 text-sm font-medium transition-colors">Blog</a>
                <span className="text-indigo-600 text-sm font-medium">Product Updates</span>
              </nav>
            </div>
          </div>
          
          {/* Main Header */}
          <div className="py-12 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Product Updates</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Stay informed about the latest Marq platform enhancements, new features, and improvements that help you create better brand experiences.
            </p>
              
              {/* Subscribe to Updates */}
              <div className="flex items-center justify-center space-x-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={subscribedEmail}
                  onChange={(e) => setSubscribedEmail(e.target.value)}
                  placeholder="Get notified of new updates"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <button
                  onClick={handleSubscribe}
                  disabled={isSubscribing || !subscribedEmail.trim()}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm font-medium"
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
      <div className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search product updates..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex space-x-4">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium min-w-[140px]"
                >
                  <option value="all">All Categories</option>
                  <option value="Added">🆕 New Features</option>
                  <option value="Improved">⚡ Improvements</option>
                  <option value="Fixed">🔧 Bug Fixes</option>
                  <option value="Security">🔒 Security</option>
                  <option value="Deprecated">⚠️ Deprecated</option>
                </select>

                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium min-w-[140px]"
                >
                  <option value="all">All Time</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 3 months</option>
                  <option value="365d">Last year</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Changelog Entries */}
        <div className="space-y-8">
          {filteredEntries.map((entry) => {
            const isExpanded = expandedEntries.has(entry.id);
            
            return (
              <article
                key={entry.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <div className="p-8">
                  {/* Entry Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(entry.category)}`}>
                          {getCategoryIcon(entry.category)} {entry.category}
                        </span>
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {entry.version}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                        {entry.customer_facing_title}
                      </h2>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDistanceToNow(new Date(entry.release_date), { addSuffix: true })}
                          </span>
                        </div>
                        {entry.affected_users && (
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>
                              {entry.affected_users.toLocaleString()} users
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="prose max-w-none mb-6">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {entry.customer_facing_description}
                    </p>
                  </div>

                  {/* Highlights Preview */}
                  {entry.highlights.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Highlights:</h3>
                      <ul className="space-y-3">
                        {entry.highlights.slice(0, isExpanded ? entry.highlights.length : 3).map((highlight, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                            <span className="text-gray-700 leading-relaxed">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {entry.highlights.length > 3 && !isExpanded && (
                        <button
                          onClick={() => toggleExpanded(entry.id)}
                          className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-2 text-sm transition-colors"
                        >
                          <span>Show {entry.highlights.length - 3} more highlights</span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

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
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Eye className="w-4 h-4" />
                        <span>{entry.view_count.toLocaleString()} views</span>
                      </div>
                      
                      <button
                        onClick={() => handleUpvote(entry.id)}
                        className="flex items-center space-x-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors group"
                      >
                        <ThumbsUp className="w-4 h-4 group-hover:text-indigo-600" />
                        <span>{entry.upvotes} helpful</span>
                      </button>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <MessageSquare className="w-4 h-4" />
                        <span>{entry.feedback_count} comments</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {isExpanded && (
                        <button
                          onClick={() => toggleExpanded(entry.id)}
                          className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-2 transition-colors"
                        >
                          <span>Show less</span>
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => navigator.clipboard.writeText(window.location.href + '#' + entry.id)}
                        className="text-sm text-gray-500 hover:text-indigo-600 flex items-center space-x-2 transition-colors"
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
          <div className="text-center py-16">
            <div className="text-gray-300 text-6xl mb-6">📝</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No updates found</h3>
            <p className="text-gray-600 text-lg">
              {searchQuery || categoryFilter !== 'all' || timeFilter !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for'
                : 'Check back soon for the latest Marq platform updates'}
            </p>
          </div>
        )}

        {/* RSS Feed Link */}
        <div className="text-center py-12 border-t border-gray-100">
          <a
            href="/api/public-changelog?format=rss"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Subscribe to RSS Feed</span>
          </a>
        </div>
      </div>

      {/* Marq Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <svg width="80" height="24" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 4.8V19.2H4.8V12.48L8.64 19.2H14.4L9.12 11.04L14.4 4.8H8.64L4.8 10.32V4.8H0Z" fill="white"/>
                  <path d="M16.8 4.8V19.2H21.6V16.32H26.4V12.48H21.6V8.64H28.8V4.8H16.8Z" fill="white"/>
                  <path d="M31.2 4.8V19.2H36V15.36L38.4 19.2H43.2L39.6 13.44L43.2 4.8H38.4L36 10.08V4.8H31.2Z" fill="white"/>
                  <path d="M52.8 4.8C49.44 4.8 46.8 7.44 46.8 12S49.44 19.2 52.8 19.2S58.8 16.56 58.8 12S56.16 4.8 52.8 4.8ZM52.8 15.36C51.84 15.36 51.6 14.4 51.6 12S51.84 8.64 52.8 8.64S54 9.6 54 12S53.76 15.36 52.8 15.36Z" fill="white"/>
                </svg>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Marq empowers teams to create consistent, on-brand content at scale. Stay updated with our latest platform improvements and new features.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="https://www.marq.com" className="hover:text-white transition-colors">Homepage</a></li>
                <li><a href="https://www.marq.com/blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="/api/public-changelog?format=rss" className="hover:text-white transition-colors">RSS Feed</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="https://help.marq.com" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="https://www.marq.com/contact" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="https://status.marq.com" className="hover:text-white transition-colors">System Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Marq. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm mt-2 sm:mt-0">
              Built with ❤️ for our amazing users
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}