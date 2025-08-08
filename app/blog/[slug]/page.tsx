'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { 
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share,
  BookOpen,
  Edit
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  type: 'blog' | 'case_study' | 'press_release' | 'newsletter';
  status: 'draft' | 'review' | 'published';
  author: string;
  published_date?: string;
  created_date: string;
  description: string;
  reading_time: number;
  tags: string[];
  featured_image: string;
  excerpt: string;
  slug: string;
  content?: string;
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Check if user came from content builder (for edit mode navigation)
  const fromEditor = searchParams.get('from') === 'editor';

  // Helper function to find posts in localStorage
  const findPostInLocalStorage = (targetSlug: string, includeUnpublished: boolean = false) => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('content_status_')) {
          try {
            const statusData = JSON.parse(localStorage.getItem(key) || '{}');
            
            // Check if this content matches the slug and status requirements
            if (statusData.title) {
              const slug = statusData.title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
                
              if (slug === targetSlug) {
                // For published content or when includeUnpublished is true
                if (statusData.status === 'published' || includeUnpublished) {
                  const contentId = key.replace('content_status_', '');
                  
                  return {
                    id: contentId,
                    title: statusData.title,
                    type: statusData.type || 'blog',
                    status: statusData.status || 'draft',
                    author: 'Content Creator',
                    published_date: statusData.publishedAt || statusData.savedAt || new Date().toISOString(),
                    created_date: statusData.savedAt || new Date().toISOString(),
                    description: `Created with Content Builder`,
                    reading_time: 5,
                    tags: ['Content Builder', statusData.type || 'Blog'],
                    featured_image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=240&fit=crop',
                    excerpt: `${statusData.title} - Created with Content Builder`,
                    slug: slug
                  };
                }
              }
            }
          } catch (parseError) {
            console.warn('Failed to parse content status:', key, parseError);
          }
        }
      }
    } catch (error) {
      console.error('Error searching localStorage for post:', error);
    }
    
    return null;
  };

  useEffect(() => {
    fetchPost();
  }, [resolvedParams.slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      // Try API first (though it now returns empty for actual content)
      let response = await fetch(`/api/content-pipeline?status=published`);
      let data = await response.json();
      let foundPost = null;
      
      if (response.ok && data.success && data.content) {
        foundPost = data.content.find((p: BlogPost) => p.slug === resolvedParams.slug);
      }
      
      // If not found in API, check localStorage for actual content
      if (!foundPost) {
        console.log('🔍 Blog Post: No API content, checking localStorage for actual content');
        foundPost = findPostInLocalStorage(resolvedParams.slug, fromEditor);
      }
      
      if (foundPost) {
        // Try to get the actual formatted content from localStorage first
        let actualContent = null;
        
        // Check both unified and legacy keys for the saved HTML content
        const unifiedHTMLKey = `preview_html_${foundPost.id}_latest`;
        const legacyHTMLKey = `preview_html_${foundPost.id}`;
        
        actualContent = localStorage.getItem(unifiedHTMLKey) || localStorage.getItem(legacyHTMLKey);
        
        if (actualContent) {
          console.log('✅ Blog: Using actual formatted content from localStorage');
          setPost({ ...foundPost, content: actualContent });
        } else {
          console.log('⚠️ Blog: No saved content found - content may not have been properly saved');
          // Set the post without content - this will show a message to the user
          setPost({ 
            ...foundPost, 
            content: '<div style="padding: 2rem; text-align: center; color: #6b7280;"><p>Content not available. Please return to the Content Builder to view this article.</p><p style="font-size: 0.875rem; margin-top: 1rem;">This may happen if the content was not properly saved or published.</p></div>' 
          });
        }
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const generateFullContent = (post: BlogPost) => {
    // Generate realistic blog content based on the post type and description
    switch (post.type) {
      case 'blog':
        return `
          <div class="prose prose-lg max-w-none">
            <p class="lead">${post.excerpt}</p>
            
            <h2>Introduction</h2>
            <p>${post.description}</p>
            
            <h2>Key Insights</h2>
            <p>In today's rapidly evolving technological landscape, organizations are constantly seeking ways to leverage data for competitive advantage. Our analysis reveals several critical trends that will shape the industry over the next several years.</p>
            
            <h3>Market Transformation</h3>
            <p>The shift towards AI-powered analytics represents a fundamental change in how businesses approach data processing and decision-making. Companies that adapt quickly to these changes will find themselves at a significant advantage.</p>
            
            <h3>Implementation Strategies</h3>
            <p>Successful implementation requires a comprehensive approach that considers both technical capabilities and organizational readiness. Key factors include:</p>
            <ul>
              <li>Technical infrastructure assessment</li>
              <li>Team skill development</li>
              <li>Change management processes</li>
              <li>Continuous monitoring and optimization</li>
            </ul>
            
            <h2>Looking Forward</h2>
            <p>As we continue to monitor these trends, it's clear that organizations must remain agile and responsive to change. The future belongs to those who can effectively harness the power of data analytics while maintaining focus on user needs and business objectives.</p>
            
            <h2>Conclusion</h2>
            <p>The evolution of data analytics presents both challenges and opportunities. By staying informed about industry trends and best practices, organizations can position themselves for success in this dynamic environment.</p>
          </div>
        `;
        
      case 'case_study':
        return `
          <div class="prose prose-lg max-w-none">
            <p class="lead">${post.excerpt}</p>
            
            <h2>Executive Summary</h2>
            <p>${post.description}</p>
            
            <h2>The Challenge</h2>
            <p>Our client faced significant challenges in their existing systems, including outdated technology, inefficient processes, and limited scalability. These issues were impacting both operational efficiency and customer satisfaction.</p>
            
            <h2>Our Approach</h2>
            <p>We implemented a comprehensive solution that addressed both immediate needs and long-term strategic goals:</p>
            <ol>
              <li><strong>Assessment Phase:</strong> Thorough evaluation of existing systems and processes</li>
              <li><strong>Design Phase:</strong> Development of a tailored solution architecture</li>
              <li><strong>Implementation Phase:</strong> Phased rollout with continuous testing and optimization</li>
              <li><strong>Optimization Phase:</strong> Performance monitoring and iterative improvements</li>
            </ol>
            
            <h2>Results</h2>
            <p>The transformation delivered significant measurable benefits:</p>
            <ul>
              <li>200% improvement in operational efficiency</li>
              <li>85% reduction in processing time</li>
              <li>60% increase in customer satisfaction scores</li>
              <li>ROI achieved within 18 months</li>
            </ul>
            
            <h2>Key Success Factors</h2>
            <p>Several factors contributed to the project's success, including strong leadership support, comprehensive training programs, and a phased implementation approach that minimized disruption.</p>
            
            <h2>Lessons Learned</h2>
            <p>This engagement reinforced the importance of thorough planning, stakeholder engagement, and continuous communication throughout the transformation process.</p>
          </div>
        `;
        
      case 'press_release':
        return `
          <div class="prose prose-lg max-w-none">
            <p class="lead">${post.excerpt}</p>
            
            <h2>Product Announcement</h2>
            <p>${post.description}</p>
            
            <h2>Key Features</h2>
            <p>Our new security framework introduces several groundbreaking capabilities designed to meet the evolving needs of enterprise customers:</p>
            
            <h3>Advanced Threat Detection</h3>
            <p>Utilizing machine learning algorithms, the system can identify and respond to potential security threats in real-time, significantly reducing response times and improving overall security posture.</p>
            
            <h3>Zero-Trust Architecture</h3>
            <p>Built on zero-trust principles, every access request is verified and authenticated, ensuring maximum security regardless of user location or device.</p>
            
            <h3>Seamless Integration</h3>
            <p>The framework is designed to integrate smoothly with existing enterprise systems, minimizing disruption during implementation.</p>
            
            <h2>Industry Impact</h2>
            <p>This release represents a significant advancement in enterprise security technology, setting new standards for protection and usability in the industry.</p>
            
            <h2>Availability</h2>
            <p>The security framework is available immediately for enterprise customers, with flexible pricing options and comprehensive support services.</p>
            
            <h2>About Marq</h2>
            <p>Marq is a leading provider of innovative technology solutions, helping organizations worldwide achieve their digital transformation goals through cutting-edge products and services.</p>
          </div>
        `;
        
      default:
        return `
          <div class="prose prose-lg max-w-none">
            <p class="lead">${post.excerpt}</p>
            <p>${post.description}</p>
            <p>This content provides valuable insights and practical guidance for organizations looking to improve their operations and achieve better results.</p>
          </div>
        `;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading article...</p>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-8">
                <div className="text-3xl font-bold text-gray-900">marq</div>
                <nav className="flex items-center space-x-6">
                  <Link href="/blog" className="text-gray-900 font-medium">Blog</Link>
                  <Link href="/public-changelog" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Product Updates
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Not Found */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 text-lg mb-8">
              The article you're looking for doesn't exist or has been moved.
            </p>
            <Link 
              href="/blog"
              className="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Blog</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-8">
              <div className="text-3xl font-bold text-gray-900">marq</div>
              <nav className="flex items-center space-x-6">
                <Link href="/blog" className="text-gray-900 font-medium">Blog</Link>
                <Link href="/public-changelog" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Product Updates
                </Link>
              </nav>
            </div>
            
            {/* Edit Mode Navigation - shown when coming from content builder */}
            {fromEditor && post && (
              <div className="flex items-center space-x-3">
                {post.status !== 'published' && (
                  <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
                    <div className="w-2 h-2 rounded-full bg-amber-600" />
                    <span>Draft Preview</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    // Navigate back to content builder in edit mode
                    const editUrl = `/content-pipeline/create?edit=${post.id}&type=${post.type}&title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(post.description || post.excerpt)}`;
                    router.push(editUrl);
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Content
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link 
            href="/blog"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blog</span>
          </Link>
        </div>

        {/* Featured Image - Hero Position */}
        {post.featured_image && (
          <div className="mb-8">
            <img 
              src={post.featured_image} 
              alt={post.title}
              className="w-full h-80 object-cover"
            />
          </div>
        )}

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-white text-gray-800 border border-gray-200">
              {post.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            {post.tags.slice(0, 3).map(tag => (
              <span key={tag} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
            {post.title}
          </h1>

          {/* Author Info with Avatar */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
                {post.author.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="font-medium text-gray-900">{post.author}</div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>
                    {post.published_date 
                      ? new Date(post.published_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : formatDistanceToNow(new Date(post.created_date), { addSuffix: true })
                    }
                  </span>
                  <span>•</span>
                  <span>{post.reading_time} min read</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div 
          className={`max-w-none mb-12 ${post.content?.includes('style=') ? '' : 'prose prose-lg prose-gray'}`}
          style={{
            lineHeight: '1.7',
            fontSize: '1.125rem'
          }}
          dangerouslySetInnerHTML={{ __html: post.content || '' }}
        />

        {/* Article Footer */}
        <footer className="border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 text-sm font-medium">Share this article</span>
              <div className="flex items-center space-x-2">
                <button className="inline-flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 transition-colors">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </button>
                <button className="inline-flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 transition-colors">
                  LinkedIn
                </button>
                <button className="inline-flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 transition-colors">
                  Twitter
                </button>
              </div>
            </div>
          </div>
          
          {/* Author Bio */}
          <div className="bg-gray-50 p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-200 flex items-center justify-center font-bold text-gray-700 text-lg">
                {post.author.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{post.author}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Contributing writer focused on customer intelligence, data analytics, and digital transformation strategies. 
                  Passionate about helping businesses leverage data for competitive advantage.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </article>

      {/* Simple Footer */}
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