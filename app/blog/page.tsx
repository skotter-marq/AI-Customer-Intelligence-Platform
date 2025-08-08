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
  Clock,
  User,
  FileText,
  BookOpen,
  TrendingUp,
  Award,
  ArrowRight,
  Tag as TagIcon,
  X,
  Share
} from 'lucide-react';
import React from 'react';

interface BlogPost {
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
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      
      // First try the API (which now returns empty for actual content)
      const response = await fetch('/api/content-pipeline?status=published');
      const data = await response.json();
      
      if (response.ok && data.success && data.content && data.content.length > 0) {
        console.log('✅ Blog: Using API content:', data.content.length, 'items');
        setPosts(data.content);
      } else {
        // API returned empty, so look for actual content in localStorage
        console.log('📋 Blog: API returned empty, checking localStorage for actual content');
        const actualContent = getContentFromLocalStorage();
        
        if (actualContent.length > 0) {
          console.log('✅ Blog: Found actual content in localStorage:', actualContent.length, 'items');
          setPosts(actualContent);
        } else {
          console.log('📋 Blog: No content found - create content using Content Builder');
          setPosts([]);
        }
      }
    } catch (error) {
      console.error('❌ Blog: Network error fetching content:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Get actual content created through Content Builder from localStorage
  const getContentFromLocalStorage = () => {
    const actualContent: BlogPost[] = [];
    
    try {
      // Look for all content status keys that indicate published content
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('content_status_')) {
          try {
            const statusData = JSON.parse(localStorage.getItem(key) || '{}');
            
            // Only include published content
            if (statusData.status === 'published' && statusData.title) {
              // Extract content ID from the key
              const contentId = key.replace('content_status_', '');
              
              // Generate slug from title
              const slug = statusData.title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
              
              // Create blog post object
              const blogPost: BlogPost = {
                id: contentId,
                title: statusData.title,
                type: statusData.type || 'blog',
                status: 'published',
                author: 'Content Creator', // Default author
                published_date: statusData.publishedAt || statusData.savedAt || new Date().toISOString(),
                created_date: statusData.savedAt || new Date().toISOString(),
                description: `Published content created through Content Builder.`,
                feature_title: statusData.title,
                feature_category: statusData.type || 'General',
                reading_time: 5, // Default reading time
                tags: ['Content Builder', statusData.type || 'Blog'],
                featured_image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=240&fit=crop',
                excerpt: `${statusData.title} - Created with Content Builder`,
                slug: slug
              };
              
              actualContent.push(blogPost);
            }
          } catch (parseError) {
            console.warn('Failed to parse content status:', key, parseError);
          }
        }
      }
      
      // Sort by published date (newest first)
      actualContent.sort((a, b) => 
        new Date(b.published_date || b.created_date).getTime() - 
        new Date(a.published_date || a.created_date).getTime()
      );
      
    } catch (error) {
      console.error('Error reading content from localStorage:', error);
    }
    
    return actualContent;
  };

  const filteredPosts = posts.filter(post => {
    // Search filter
    if (searchQuery) {
      const matchesSearch = (
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      if (!matchesSearch) return false;
    }

    // Type filter
    if (typeFilter !== 'all' && post.type !== typeFilter) return false;

    // Tag filter
    if (selectedTags.size > 0 && !post.tags.some(tag => selectedTags.has(tag))) return false;

    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return FileText;
      case 'case_study': return Award;
      case 'press_release': return MessageSquare;
      case 'newsletter': return BookOpen;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blog': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'case_study': return 'bg-green-100 text-green-800 border-green-200';
      case 'press_release': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'newsletter': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'blog': return 'Blog Post';
      case 'case_study': return 'Case Study';
      case 'press_release': return 'Press Release';
      case 'newsletter': return 'Newsletter';
      default: return type;
    }
  };

  const getAllTags = () => {
    const allTags = new Set<string>();
    posts.forEach(post => {
      post.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  };

  const toggleTag = (tag: string) => {
    const newSelectedTags = new Set(selectedTags);
    if (newSelectedTags.has(tag)) {
      newSelectedTags.delete(tag);
    } else {
      newSelectedTags.add(tag);
    }
    setSelectedTags(newSelectedTags);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading content...</p>
        </div>
      </div>
    );
  }

  const featuredPost = filteredPosts[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Marq Header - matching public changelog */}
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
                <span className="text-gray-900 font-medium">Blog</span>
                <Link 
                  href="/public-changelog"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Product Updates
                </Link>
              </nav>
            </div>
          </div>
          
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {filteredPosts.length > 0 && (
          <>
            {/* Featured Section */}
            <div className="py-8 mb-12">
              <div className="bg-gray-50 p-6 lg:p-8">
                <div className="grid lg:grid-cols-5 gap-8 items-center">
                  <div className="lg:col-span-3">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-xs font-semibold text-gray-700 bg-white px-2 py-1 border border-gray-200">Featured</span>
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white text-gray-800 border border-gray-200">
                        {React.createElement(getTypeIcon(filteredPosts[0].type), { className: 'w-3 h-3 mr-1' })}
                        {getTypeLabel(filteredPosts[0].type)}
                      </span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                      {filteredPosts[0].title}
                    </h1>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">
                      {filteredPosts[0].excerpt || filteredPosts[0].description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
                      <span className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{filteredPosts[0].author}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{filteredPosts[0].reading_time} min read</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {filteredPosts[0].published_date 
                            ? new Date(filteredPosts[0].published_date).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric',
                                year: 'numeric' 
                              })
                            : 'Draft'
                          }
                        </span>
                      </span>
                    </div>
                    <button 
                      onClick={() => window.open(`/blog/${filteredPosts[0].slug}`, '_blank')}
                      className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors font-semibold"
                    >
                      Read Article
                    </button>
                  </div>
                  <div className="lg:col-span-2">
                    <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                      {filteredPosts[0].featured_image ? (
                        <img 
                          src={filteredPosts[0].featured_image} 
                          alt={filteredPosts[0].title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          {React.createElement(getTypeIcon(filteredPosts[0].type), { className: 'w-16 h-16 text-gray-500 mx-auto mb-2' })}
                          <span className="text-gray-600 font-medium">{getTypeLabel(filteredPosts[0].type)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Article Grid */}
            {filteredPosts.length > 1 && (
              <div>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">More Articles</h3>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search articles..."
                        className="pl-10 pr-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-gray-400 w-64"
                      />
                    </div>
                    
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-3 py-3 border border-gray-200 focus:outline-none focus:border-gray-400 text-sm bg-white"
                    >
                      <option value="all">All Content</option>
                      <option value="blog">Blog Posts</option>
                      <option value="case_study">Customer Stories</option>
                      <option value="press_release">Press Releases</option>
                      <option value="newsletter">Newsletters</option>
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPosts.slice(1).map((post) => (
                    <article
                      key={post.id}
                      onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                      className="bg-white border border-gray-200 hover:border-gray-300 transition-colors duration-200 overflow-hidden group cursor-pointer"
                    >
                      <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden">
                        {post.featured_image ? (
                          <img 
                            src={post.featured_image} 
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {React.createElement(getTypeIcon(post.type), { className: 'w-12 h-12 text-gray-400' })}
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-white text-gray-800 border border-gray-200">
                            {React.createElement(getTypeIcon(post.type), { className: 'w-3 h-3 mr-1' })}
                            {getTypeLabel(post.type)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs text-gray-600 bg-gray-100 px-2 py-1">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                          {post.excerpt || post.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{post.author}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{post.reading_time}m</span>
                            </span>
                          </div>
                          <time>
                            {post.published_date 
                              ? new Date(post.published_date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })
                              : 'Draft'
                            }
                          </time>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20 border border-gray-200 bg-gray-50">
            <div className="text-gray-400 mb-6">
              <BookOpen className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No articles found</h3>
            <p className="text-gray-600 text-lg mb-6">
              {searchQuery || typeFilter !== 'all' || selectedTags.size > 0
                ? 'Try adjusting your search or filters'
                : 'No published content available. Create and publish content using the Content Builder to see articles here.'}
            </p>
            {!searchQuery && typeFilter === 'all' && selectedTags.size === 0 && (
              <div className="mt-6">
                <a 
                  href="/content-pipeline/create"
                  className="inline-flex items-center px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors font-semibold"
                >
                  Create Your First Article
                </a>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Simple Footer - matching public changelog */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">marq</div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Marq. Blog and insights.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}