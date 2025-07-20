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
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');
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

  const fetchContentItems = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockItems: ContentItem[] = [
        {
          id: '1',
          title: 'The Future of Data Analytics: Industry Trends and Market Evolution',
          type: 'blog',
          status: 'published',
          author: 'Sarah Chen',
          published_date: '2024-01-15',
          created_date: '2024-01-10',
          description: 'Thought leadership piece analyzing emerging trends in data analytics and our strategic position in the evolving market landscape.',
          feature_title: 'AI-Powered Data Export',
          feature_category: 'Data Management',
          reading_time: 8,
          tags: ['Thought Leadership', 'Data Analytics', 'Market Trends', 'Industry Analysis'],
          featured_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=240&fit=crop',
          excerpt: 'Explore the future of data analytics and how emerging trends are reshaping the industry landscape.',
          slug: 'future-data-analytics-industry-trends',
          views: 2847,
          engagement: 78,
          selected_layout: 'blog_thought_leadership',
          layout_completed: true,
          generated_content: {
            sections: [
              {
                title: 'Executive Summary',
                content: 'The data analytics landscape is experiencing unprecedented transformation driven by AI, machine learning, and real-time processing capabilities.',
                type: 'text'
              },
              {
                title: 'Market Evolution Video',
                content: 'Interactive visualization showing data analytics market growth from 2020-2025',
                type: 'video'
              },
              {
                title: 'Key Industry Trends',
                content: 'Analysis of five major trends reshaping how organizations approach data analytics and business intelligence.',
                type: 'text'
              }
            ]
          }
        },
        {
          id: '2',
          title: 'TechCorp Digital Transformation: Complete Customer Journey',
          type: 'case_study',
          status: 'published',
          author: 'Michael Rodriguez',
          published_date: '2024-01-12',
          created_date: '2024-01-08',
          description: 'Comprehensive case study documenting TechCorp\'s complete digital transformation journey from initial challenges through implementation to measurable results.',
          feature_title: 'Real-time Dashboard Widgets',
          feature_category: 'User Interface',
          reading_time: 12,
          tags: ['Customer Transformation', 'Digital Innovation', 'Enterprise Success', 'ROI'],
          featured_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=240&fit=crop',
          excerpt: 'Follow TechCorp\'s remarkable transformation journey and discover the strategies that delivered 200% ROI.',
          slug: 'techcorp-digital-transformation-journey',
          views: 1923,
          engagement: 82,
          selected_layout: 'case_study_transformation',
          layout_completed: true,
          generated_content: {
            sections: [
              {
                title: 'Challenge Overview',
                content: 'TechCorp faced declining efficiency and outdated systems that hindered growth and customer satisfaction.',
                type: 'text'
              },
              {
                title: 'Implementation Journey',
                content: 'Behind-the-scenes video showcasing the 6-month transformation process',
                type: 'video'
              },
              {
                title: 'Measurable Results',
                content: '200% ROI achieved within 18 months through improved efficiency and customer satisfaction metrics.',
                type: 'text'
              },
              {
                title: 'Key Success Factors',
                content: 'Strategic insights that made the difference between success and failure in this digital transformation.',
                type: 'text'
              }
            ]
          }
        },
        {
          id: '3',
          title: 'Announcing Next-Generation Security Framework: Enterprise Protection Redefined',
          type: 'press_release',
          status: 'published',
          author: 'Lisa Park',
          published_date: '2024-01-08',
          created_date: '2024-01-05',
          description: 'Major product launch announcement detailing our revolutionary security framework with breakthrough features and enterprise-grade capabilities.',
          feature_title: 'Advanced Security Framework',
          feature_category: 'Security',
          reading_time: 6,
          tags: ['Product Launch', 'Security Innovation', 'Enterprise', 'Press Release'],
          featured_image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=240&fit=crop',
          excerpt: 'Introducing our revolutionary security framework that redefines enterprise protection standards.',
          slug: 'next-generation-security-framework-launch',
          views: 3241,
          engagement: 65,
          selected_layout: 'press_release_announcement',
          layout_completed: true,
          generated_content: {
            sections: [
              {
                title: 'Product Announcement',
                content: 'Today we announce the launch of our next-generation security framework, setting new industry standards for enterprise protection.',
                type: 'text'
              },
              {
                title: 'Product Demo Video',
                content: 'Live demonstration of the security framework features and capabilities',
                type: 'video'
              },
              {
                title: 'Key Features & Benefits',
                content: 'Advanced threat detection, zero-trust architecture, and seamless integration with existing enterprise systems.',
                type: 'text'
              },
              {
                title: 'Availability & Pricing',
                content: 'The security framework is available immediately for enterprise customers with flexible pricing options.',
                type: 'text'
              }
            ]
          }
        },
        {
          id: '4',
          title: 'Step-by-Step Guide: Implementing Real-Time Analytics',
          type: 'blog',
          status: 'review',
          author: 'David Kim',
          created_date: '2024-01-14',
          description: 'Comprehensive how-to guide walking users through real-time analytics implementation with practical examples, code snippets, and troubleshooting tips.',
          feature_title: 'Real-time Analytics Engine',
          feature_category: 'Analytics',
          reading_time: 15,
          tags: ['How-To Guide', 'Implementation', 'Analytics', 'Tutorial'],
          featured_image: 'https://images.unsplash.com/photo-1551634804-cdd3e556b1f5?w=400&h=240&fit=crop',
          excerpt: 'Master real-time analytics implementation with our comprehensive step-by-step tutorial.',
          slug: 'step-by-step-real-time-analytics-guide',
          selected_layout: 'blog_howto_guide',
          layout_completed: true,
          generated_content: {
            sections: [
              {
                title: 'Prerequisites & Setup',
                content: 'System requirements and initial configuration steps for implementing real-time analytics.',
                type: 'text'
              },
              {
                title: 'Implementation Code Example',
                content: 'const analytics = new RealTimeEngine({ apiKey: "your-key", streamUrl: "wss://api.example.com" });',
                type: 'code'
              },
              {
                title: 'Configuration Walkthrough',
                content: 'Interactive video guide showing each configuration step',
                type: 'video'
              },
              {
                title: 'Troubleshooting Common Issues',
                content: 'Solutions for the most frequently encountered problems during implementation.',
                type: 'text'
              }
            ]
          }
        },
        {
          id: '5',
          title: 'Product Spotlight: Revolutionary Features Driving Innovation',
          type: 'newsletter',
          status: 'draft',
          author: 'Jennifer Wu',
          created_date: '2024-01-16',
          description: 'Feature-focused newsletter showcasing our latest breakthrough capabilities with in-depth tutorials and expert insights.',
          feature_title: 'AI Content Generation',
          feature_category: 'Artificial Intelligence',
          reading_time: 10,
          tags: ['Feature Focus', 'Innovation', 'AI Technology', 'Product Updates'],
          featured_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=240&fit=crop',
          excerpt: 'Discover our revolutionary AI-powered features and learn how to leverage them for maximum impact.',
          slug: 'product-spotlight-revolutionary-features',
          selected_layout: 'newsletter_focused',
          layout_completed: true,
          generated_content: {
            sections: [
              {
                title: 'Featured Innovation',
                content: 'This month we spotlight our AI Content Generation feature that\'s transforming how teams create and optimize content.',
                type: 'text'
              },
              {
                title: 'Feature Demonstration',
                content: 'Watch our AI Content Generation in action with real customer examples',
                type: 'video'
              },
              {
                title: 'Customer Success Story',
                content: '"The AI Content Generation feature helped us increase content production by 300% while maintaining quality." - Sarah J., Marketing Director',
                type: 'quote'
              },
              {
                title: 'Getting Started Guide',
                content: 'Step-by-step instructions to start using AI Content Generation in your workflow today.',
                type: 'text'
              }
            ]
          }
        },
        {
          id: '6',
          title: 'Platform vs. Competitors: Comprehensive Feature Analysis',
          type: 'blog',
          status: 'draft',
          author: 'Alex Thompson',
          created_date: '2024-01-18',
          description: 'In-depth comparison analysis showcasing our platform\'s unique advantages against alternative solutions in the market.',
          feature_title: 'Advanced Analytics Suite',
          feature_category: 'Analytics',
          reading_time: 11,
          tags: ['Competitive Analysis', 'Platform Comparison', 'Market Research', 'Features'],
          featured_image: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=400&h=240&fit=crop',
          excerpt: 'See how our platform outperforms competitors with superior features and innovative capabilities.',
          slug: 'platform-vs-competitors-feature-analysis',
          selected_layout: 'blog_comparison',
          layout_completed: true,
          generated_content: {
            sections: [
              {
                title: 'Market Landscape Overview',
                content: 'Analysis of the current competitive landscape and where our platform stands among industry leaders.',
                type: 'text'
              },
              {
                title: 'Feature Comparison Matrix',
                content: 'Interactive comparison chart showing feature availability across platforms',
                type: 'video'
              },
              {
                title: 'Unique Advantages',
                content: 'Our platform delivers superior performance in real-time analytics, user experience, and integration capabilities.',
                type: 'text'
              },
              {
                title: 'Customer Migration Case Studies',
                content: 'Real examples of customers who switched to our platform and the benefits they experienced.',
                type: 'text'
              }
            ]
          }
        },
        {
          id: '7',
          title: 'Behind the Code: Building Our Mobile-First Architecture',
          type: 'blog',
          status: 'published',
          author: 'Maya Patel',
          published_date: '2024-01-20',
          created_date: '2024-01-15',
          description: 'Development story revealing the human journey behind our mobile-first architecture with team insights and technical challenges.',
          feature_title: 'Mobile App Integration',
          feature_category: 'Mobile',
          reading_time: 9,
          tags: ['Behind the Scenes', 'Development Story', 'Mobile Architecture', 'Team Insights'],
          featured_image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=240&fit=crop',
          excerpt: 'Go behind the scenes with our development team and discover the challenges overcome building our mobile architecture.',
          slug: 'behind-code-mobile-first-architecture',
          views: 1456,
          engagement: 73,
          selected_layout: 'blog_behind_scenes',
          layout_completed: true,
          generated_content: {
            sections: [
              {
                title: 'Feature Origin Story',
                content: 'The idea for our mobile-first architecture came from a simple observation: our users were increasingly accessing our platform from mobile devices, but our existing infrastructure was struggling to keep up.',
                type: 'text'
              },
              {
                title: 'The Spark of an Idea',
                content: 'How the mobile-first vision emerged during a critical product meeting when user engagement data revealed 70% mobile usage.',
                type: 'text'
              },
              {
                title: 'Team Member Reflection',
                content: 'The biggest challenge wasn\'t technical - it was convincing everyone that we needed to rebuild from the ground up. But once we saw the user data, it became clear this was our path forward.',
                type: 'quote'
              },
              {
                title: 'Design and Planning',
                content: 'Our design process involved extensive user research, performance benchmarking, and architectural planning to ensure we could scale to millions of users.',
                type: 'text'
              },
              {
                title: 'Design Mockups and Wireframes',
                content: 'Early wireframes and architectural diagrams showing the mobile-first approach',
                type: 'image'
              },
              {
                title: 'Development Team Interviews',
                content: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                type: 'video'
              },
              {
                title: 'Development Challenges',
                content: 'The biggest technical obstacle was maintaining sub-200ms response times while supporting real-time data synchronization across multiple mobile platforms.',
                type: 'text'
              },
              {
                title: 'Technical Solution',
                content: 'const mobileOptimizer = new PerformanceEngine({\n  caching: "intelligent",\n  compression: "adaptive",\n  realTime: true,\n  maxResponseTime: 200\n});',
                type: 'code'
              },
              {
                title: 'Testing and Refinement',
                content: 'We conducted extensive beta testing with over 500 mobile users, iterating on performance and user experience based on real usage patterns.',
                type: 'text'
              },
              {
                title: 'Beta User Feedback',
                content: 'The new mobile experience is incredible - everything loads instantly and the interface feels native. This is exactly what we needed.',
                type: 'quote'
              },
              {
                title: 'Lessons Learned',
                content: 'Building mobile-first taught us that performance constraints often lead to better overall architecture. The optimizations we made for mobile improved our entire platform.',
                type: 'text'
              }
            ]
          }
        },
        {
          id: '8',
          title: 'ROI Analysis: Quantifying Enterprise Value and Impact',
          type: 'case_study',
          status: 'published',
          author: 'Carlos Rivera',
          published_date: '2024-01-18',
          created_date: '2024-01-12',
          description: 'Numbers-driven case study emphasizing quantifiable business value, financial impact, and measurable ROI metrics.',
          feature_title: 'Enterprise Reporting Suite',
          feature_category: 'Business Intelligence',
          reading_time: 14,
          tags: ['ROI Analysis', 'Financial Impact', 'Enterprise Value', 'Metrics'],
          featured_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=240&fit=crop',
          excerpt: 'Discover the quantifiable business impact and measurable ROI delivered by our enterprise solutions.',
          slug: 'roi-analysis-enterprise-value-impact',
          views: 2134,
          engagement: 85,
          selected_layout: 'case_study_roi_focused',
          layout_completed: true,
          generated_content: {
            sections: [
              {
                title: 'Executive Summary',
                content: 'Comprehensive analysis showing 240% ROI achieved through our Enterprise Reporting Suite implementation.',
                type: 'text'
              },
              {
                title: 'Financial Impact Visualization',
                content: 'Interactive charts showing cost savings and revenue growth over 24 months',
                type: 'video'
              },
              {
                title: 'Key Performance Metrics',
                content: '40% reduction in reporting time, 60% improvement in data accuracy, and 240% ROI within 18 months.',
                type: 'text'
              },
              {
                title: 'Implementation Timeline',
                content: 'Month-by-month breakdown of implementation milestones and corresponding business impact.',
                type: 'text'
              }
            ]
          }
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

  // Use displayOrderItems for current display, but apply filters
  const filteredAndSortedItems = (displayOrderItems.length > 0 ? displayOrderItems : contentItems)
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
          
          return updatedItem;
        }
        return item;
      });
      
      setContentItems(updatedItems);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20">
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
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6 mb-6">
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
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-blue-900">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkStatusChange('published')}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Publish All</span>
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('draft')}
                    className="flex items-center space-x-1 px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Unpublish All</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const StatusIcon = getStatusIcon(item.status);
              const TypeIcon = getTypeIcon(item.type);
              
              return (
                <div
                  key={item.id}
                  onClick={() => handleEditContent(item)}
                  className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl hover:border-blue-300 hover:bg-white transition-all duration-300 group h-[580px] flex flex-col cursor-pointer relative"
                >
                  
                  {/* Featured Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden flex-shrink-0">
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
                  <div className="p-6 flex-1 flex flex-col">
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
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 h-14 overflow-hidden">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10 overflow-hidden">{item.excerpt}</p>
                    
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
                    <div className="flex gap-1 mb-4 h-6 overflow-hidden">
                      {item.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg whitespace-nowrap flex-shrink-0">
                          {tag.length > 12 ? `${tag.substring(0, 12)}...` : tag}
                        </span>
                      ))}
                      {item.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg whitespace-nowrap flex-shrink-0">
                          +{item.tags.length - 2} more
                        </span>
                      )}
                    </div>
                    
                    {/* Metrics and Date Section - Fixed height for consistency */}
                    <div className="h-8 mb-4">
                      {item.status === 'published' ? (
                        <div className="flex items-center justify-between text-sm text-gray-600 h-full">
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
                      ) : (
                        <div className="flex items-center space-x-1 text-sm text-gray-600 h-full">
                          <Calendar className="w-4 h-4" />
                          <span>Created {formatDate(item.created_date)}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center space-x-3">
                        {/* Published Toggle Switch */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Published</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDirectStatusChange(item, item.status === 'published' ? 'draft' : 'published');
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              item.status === 'published' ? 'bg-green-600' : 'bg-gray-300'
                            }`}
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
                          className="p-2 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          title="Edit content"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/content/${item.slug}`, '_blank');
                          }}
                          className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View on site"
                        >
                          <ExternalLink className="w-4 h-4" />
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
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const StatusIcon = getStatusIcon(item.status);
                  const TypeIcon = getTypeIcon(item.type);
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleEditContent(item)}
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer relative"
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
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
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
                          
                          <p className="text-gray-600 text-sm mb-2 line-clamp-1">{item.excerpt}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                            <span className="text-sm text-gray-600">Published</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDirectStatusChange(item, item.status === 'published' ? 'draft' : 'published');
                              }}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                item.status === 'published' ? 'bg-green-600' : 'bg-gray-300'
                              }`}
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
                            className="p-2 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            title="Edit content"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/content/${item.slug}`, '_blank');
                            }}
                            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="View on site"
                          >
                            <ExternalLink className="w-4 h-4" />
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

          {/* Pagination */}
          {filteredAndSortedItems.length > itemsPerPage && (
            <div className="flex items-center justify-between mt-8 px-6 py-4 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} items
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      const newItemsPerPage = parseInt(e.target.value);
                      setCurrentPage(1);
                      // Update itemsPerPage - you'd need to make this a state variable
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            currentPage === pageNumber
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
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
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
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