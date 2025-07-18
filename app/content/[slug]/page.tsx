'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  ExternalLink,
  Globe,
  Tag,
  BookOpen,
  Eye,
  Copy,
  Download,
  Link as LinkIcon
} from 'lucide-react';

interface PublishedContent {
  id: string;
  title: string;
  content: string;
  type: 'case_study' | 'blog' | 'press_release' | 'newsletter';
  slug: string;
  author: string;
  published_date: string;
  feature_title: string;
  feature_category: string;
  reading_time: number;
  tags: string[];
  excerpt: string;
  featured_image?: string;
  seo_title?: string;
  seo_description?: string;
}

export default function PublishedContentPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [content, setContent] = useState<PublishedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContent();
  }, [slug]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockContent: PublishedContent = {
        id: '1',
        title: 'Introducing AI-Powered Data Export: Reduces Manual Export Time by 80%',
        content: `# Introducing AI-Powered Data Export: Reduces Manual Export Time by 80%

## The Challenge

In today's data-driven business environment, organizations rely heavily on accurate and timely data exports for reporting, analysis, and decision-making. However, traditional data export processes are often manual, time-consuming, and prone to human error. Teams were spending hours each week formatting exports, dealing with inconsistent data structures, and fixing errors that occurred during the export process.

## The Solution

We're thrilled to announce AI-Powered Data Export, a high-impact feature that delivers automated data export with intelligent formatting and scheduling. Released in January 2024, this feature addresses key challenges faced by Data Analysts, Operations Teams, and Business Intelligence professionals.

### Key Features

- **Intelligent Formatting**: Machine learning algorithms automatically detect and apply the optimal formatting for your data exports
- **Automated Scheduling**: Set up recurring exports that run automatically at specified intervals
- **Error Detection**: Built-in validation prevents common export errors before they occur
- **Multi-format Support**: Export to CSV, Excel, JSON, and more with a single click
- **Custom Templates**: Create and save export templates for consistent formatting across teams

## Technical Implementation

Our AI-Powered Data Export feature leverages REST API endpoints with ML-powered data transformation and export scheduling. The system uses advanced algorithms to:

1. **Analyze Data Patterns**: Automatically detect data types, relationships, and optimal formatting
2. **Intelligent Scheduling**: Machine learning models predict optimal export times based on data freshness and usage patterns
3. **Error Prevention**: Proactive validation catches issues before export completion
4. **Performance Optimization**: Smart caching and compression reduce export time by up to 85%

## Results and Impact

The implementation of AI-Powered Data Export has delivered measurable results across our customer base:

### Key Metrics
- **80% reduction in export time** - What used to take hours now takes minutes
- **95% fewer formatting errors** - Automated formatting eliminates human error
- **150% increase in data export usage** - Teams are using exports more frequently due to improved efficiency

### Customer Success Story

*"AI-Powered Data Export has transformed how our team works. The automated formatting eliminates the manual work we used to do, and the scheduling means our reports are always ready when we need them. It's saved us hours every week."*

— Michael Chen, Data Analyst at Enterprise Solutions Inc.

## Getting Started

AI-Powered Data Export is now available in your account. To get started:

1. Navigate to the Data Export section in your dashboard
2. Select your data source and desired format
3. Choose from our pre-built templates or create your own
4. Set up automated scheduling (optional)
5. Click "Export" and watch the magic happen

## Best Practices

To get the most out of AI-Powered Data Export:

- **Use Templates**: Create reusable templates for common export scenarios
- **Schedule Strategically**: Set up exports to run during off-peak hours for better performance
- **Monitor Usage**: Review export logs to optimize your data export strategy
- **Leverage Automation**: Take advantage of automated scheduling for recurring reports

## What's Next

We're continuously improving AI-Powered Data Export based on user feedback. Upcoming features include:

- Enhanced visualization options
- Advanced filtering and transformation capabilities
- Integration with popular BI tools
- Real-time export monitoring and alerts

## Conclusion

AI-Powered Data Export represents our commitment to data management excellence. By reducing manual export time by 80% and eliminating formatting errors, we're helping teams work smarter, not harder. This feature exemplifies how intelligent automation can transform routine tasks into strategic advantages.

Ready to experience the power of AI-driven data exports? Log in to your account today and try it out. Need help getting started? Our support team is here to assist you every step of the way.

---

*Keywords: ai-powered data export, data management, automated data export, business intelligence, data analysts, operations teams, productivity, efficiency*`,
        type: 'blog',
        slug: 'ai-powered-data-export-reduces-manual-export-time',
        author: 'Content AI',
        published_date: '2024-01-15T10:30:00Z',
        feature_title: 'AI-Powered Data Export',
        feature_category: 'Data Management',
        reading_time: 8,
        tags: ['AI', 'Data Export', 'Automation', 'Productivity', 'Business Intelligence'],
        excerpt: 'Discover how our new AI-Powered Data Export feature reduces manual export time by 80% while eliminating formatting errors and improving data accuracy.',
        featured_image: '/api/placeholder/1200/600',
        seo_title: 'AI-Powered Data Export: 80% Faster Data Processing | Your Company',
        seo_description: 'Revolutionary AI-powered data export feature that automates formatting, scheduling, and error detection. Reduce manual work by 80% and eliminate formatting errors.'
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setContent(mockContent);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Content not found');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Content copied to clipboard!');
  };

  const shareContent = () => {
    if (navigator.share) {
      navigator.share({
        title: content?.title,
        text: content?.excerpt,
        url: window.location.href
      });
    } else {
      copyToClipboard(window.location.href);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return BookOpen;
      case 'case_study': return User;
      case 'press_release': return Globe;
      case 'newsletter': return LinkIcon;
      default: return BookOpen;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'blog': return 'Blog Post';
      case 'case_study': return 'Case Study';
      case 'press_release': return 'Press Release';
      case 'newsletter': return 'Newsletter';
      default: return 'Article';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Not Found</h1>
          <p className="text-gray-600 mb-6">The content you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const TypeIcon = getTypeIcon(content.type);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center`}>
                <TypeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-blue-600">{getTypeLabel(content.type)}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{content.reading_time} min read</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{content.title}</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={shareContent}
                className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => copyToClipboard(window.location.href)}
                className="p-2 rounded-xl text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                title="Copy Link"
              >
                <LinkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Meta Information */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{content.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(content.published_date)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4" />
              <span>{content.feature_category}</span>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {content.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg max-w-none">
          <div 
            className="text-gray-900 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: content.content
                .replace(/^# /gm, '<h1 class="text-3xl font-bold text-gray-900 mb-6 mt-8">')
                .replace(/^## /gm, '<h2 class="text-2xl font-bold text-gray-900 mb-4 mt-8">')
                .replace(/^### /gm, '<h3 class="text-xl font-bold text-gray-900 mb-3 mt-6">')
                .replace(/^\*\*(.*?)\*\*/gm, '<strong class="font-semibold text-gray-900">$1</strong>')
                .replace(/^\*(.*?)\*/gm, '<em class="italic text-gray-800">$1</em>')
                .replace(/^- (.*)/gm, '<li class="mb-2 text-gray-700">$1</li>')
                .replace(/^(\d+)\. (.*)/gm, '<li class="mb-2 text-gray-700">$2</li>')
                .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 leading-relaxed">')
                .replace(/^(?!<[h|l|s|e])/gm, '<p class="mb-4 text-gray-700 leading-relaxed">')
                .replace(/---/g, '<hr class="border-gray-200 my-8">')
            }}
          />
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{content.author}</div>
                <div className="text-sm text-gray-600">Content Creator</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => copyToClipboard(content.content)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Content</span>
              </button>
              <button
                onClick={shareContent}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}