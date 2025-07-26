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
  published_date?: string;
  created_date: string;
  feature_title: string;
  feature_category: string;
  reading_time: number;
  tags: string[];
  excerpt: string;
  featured_image?: string;
  seo_title?: string;
  seo_description?: string;
  selected_layout?: string;
  layout_completed?: boolean;
  generated_content?: {
    sections: {
      title: string;
      content: string;
      type: 'text' | 'video' | 'image' | 'code' | 'quote';
    }[];
  };
}

export default function PublishedContentPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [content, setContent] = useState<PublishedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      
      // First, check for updated content in localStorage (from editor)
      let updatedHTML: string | null = null;
      let updatedContentData: any = null;
      
      // Find the content ID based on slug
      const slugToIdMap: { [key: string]: string } = {
        'future-data-analytics-industry-trends': '1',
        'techcorp-digital-transformation-journey': '2',
        'next-generation-security-framework-launch': '3',
        'step-by-step-real-time-analytics-guide': '4',
        'platform-vs-competitors-feature-analysis': '6',
        'product-spotlight-revolutionary-features': '5',
        'behind-code-mobile-first-architecture': '7',  
        'roi-analysis-enterprise-value-impact': '8'
      };
      
      const contentId = slugToIdMap[slug];
      if (contentId) {
        // Check for updated HTML content
        const htmlKey = `preview_html_${contentId}_latest`;
        updatedHTML = localStorage.getItem(htmlKey);
        
        // Check for updated content metadata
        const contentKey = `rich_content_${contentId}_latest`;
        const storedContent = localStorage.getItem(contentKey);
        if (storedContent) {
          try {
            updatedContentData = JSON.parse(storedContent);
            console.log('📖 CONTENT DISPLAY: Found updated content in localStorage for ID:', contentId);
          } catch (e) {
            console.warn('Failed to parse updated content data:', e);
          }
        }
      }
      
      // Mock content items from content pipeline - systematically generated
      const mockContentItems = [
        {
          id: '1',
          title: 'The Future of Data Analytics: Industry Trends and Market Evolution',
          type: 'blog' as const,
          status: 'published' as const,
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
          layout_completed: true
        },
        {
          id: '2',
          title: 'TechCorp Digital Transformation: Complete Customer Journey',
          type: 'case_study' as const,
          status: 'published' as const,
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
          layout_completed: true
        },
        {
          id: '3',
          title: 'Announcing Next-Generation Security Framework: Enterprise Protection Redefined',
          type: 'press_release' as const,
          status: 'published' as const,
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
          selected_layout: 'newsletter_community',
          layout_completed: true
        },
        {
          id: '7',
          title: 'Behind the Code: Building Our Mobile-First Architecture',
          type: 'blog' as const,
          status: 'published' as const,
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
          layout_completed: true
        },
        {
          id: '8',
          title: 'ROI Analysis: Quantifying Enterprise Value and Impact',
          type: 'case_study' as const,
          status: 'published' as const,
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
          layout_completed: true
        },
        {
          id: '4',
          title: 'Step-by-Step Guide: Implementing Real-Time Analytics',
          type: 'blog' as const,
          status: 'published' as const,
          author: 'David Kim',
          published_date: '2024-01-14',
          created_date: '2024-01-10',
          description: 'Comprehensive how-to guide walking users through real-time analytics implementation with practical examples, code snippets, and troubleshooting tips.',
          feature_title: 'Real-time Analytics Engine',
          feature_category: 'Analytics',
          reading_time: 15,
          tags: ['How-To Guide', 'Implementation', 'Analytics', 'Tutorial'],
          featured_image: 'https://images.unsplash.com/photo-1551634804-cdd3e556b1f5?w=400&h=240&fit=crop',
          excerpt: 'Master real-time analytics implementation with our comprehensive step-by-step tutorial.',
          slug: 'step-by-step-real-time-analytics-guide',
          views: 1234,
          engagement: 76,
          selected_layout: 'blog_howto_guide',
          layout_completed: true
        },
        {
          id: '5',
          title: 'Platform vs. Competitors: Comprehensive Feature Analysis',
          type: 'blog' as const,
          status: 'published' as const,
          author: 'Alex Thompson',
          published_date: '2024-01-18',
          created_date: '2024-01-15',
          description: 'In-depth comparison analysis showcasing our platform\'s unique advantages against alternative solutions in the market.',
          feature_title: 'Advanced Analytics Suite',
          feature_category: 'Analytics',
          reading_time: 11,
          tags: ['Competitive Analysis', 'Platform Comparison', 'Market Research', 'Features'],
          featured_image: 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=400&h=240&fit=crop',
          excerpt: 'See how our platform outperforms competitors with superior features and innovative capabilities.',
          slug: 'platform-vs-competitors-feature-analysis',
          views: 987,
          engagement: 68,
          selected_layout: 'blog_comparison',
          layout_completed: true
        },
        {
          id: '5',
          title: 'Product Spotlight: Revolutionary Features Driving Innovation',
          type: 'newsletter' as const,
          status: 'published' as const,
          author: 'Jennifer Wu',
          published_date: '2024-01-16',
          created_date: '2024-01-12',
          description: 'Feature-focused newsletter showcasing our latest breakthrough capabilities with in-depth tutorials and expert insights.',
          feature_title: 'AI Content Generation',
          feature_category: 'Artificial Intelligence',
          reading_time: 10,
          tags: ['Feature Focus', 'Innovation', 'AI Technology', 'Product Updates'],
          featured_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=240&fit=crop',
          excerpt: 'Discover our revolutionary AI-powered features and learn how to leverage them for maximum impact.',
          slug: 'product-spotlight-revolutionary-features',
          views: 2156,
          engagement: 84,
          selected_layout: 'newsletter_focused',
          layout_completed: true
        }
      ];

      // Find content by slug
      const foundItem = mockContentItems.find(item => item.slug === slug);
      
      if (!foundItem) {
        setError('Content not found');
        return;
      }

      // Define layout content mapping for transformation
      const layoutContentMap: { [key: string]: any[] } = {
        // BLOG LAYOUTS
        'blog_thought_leadership': [
          { type: 'text', title: 'Hook' },
          { type: 'heading2', title: 'Industry Challenge or Trend' },
          { type: 'text', title: 'Market Analysis' },
          { type: 'image', title: 'Industry Visualization' },
          { type: 'video', title: 'Expert Discussion' },
          { type: 'heading2', title: 'Our Perspective' },
          { type: 'text', title: 'Expert Analysis' },
          { type: 'quote', title: 'Industry Expert Quote' },
          { type: 'heading2', title: 'Practical Implications' },
          { type: 'list', title: 'Actionable Takeaways' },
          { type: 'text', title: 'Call to Action' }
        ],
        'blog_behind_scenes': [
          { type: 'text', title: 'Feature Origin Story' },
          { type: 'heading2', title: 'The Spark of an Idea' },
          { type: 'text', title: 'How the Idea Came About' },
          { type: 'quote', title: 'Team Member Reflection' },
          { type: 'heading2', title: 'Design and Planning' },
          { type: 'text', title: 'Design Process' },
          { type: 'image', title: 'Design Mockups' },
          { type: 'video', title: 'Team Interviews' },
          { type: 'heading2', title: 'Development Challenges' },
          { type: 'text', title: 'Technical Obstacles' },
          { type: 'code', title: 'Technical Solution' },
          { type: 'heading2', title: 'Testing and Refinement' },
          { type: 'text', title: 'User Testing Process' },
          { type: 'quote', title: 'Beta User Feedback' },
          { type: 'heading2', title: 'Lessons Learned' },
          { type: 'list', title: 'Key Insights' },
          { type: 'text', title: 'What\'s Next' }
        ],
        'press_release_announcement': [
          { type: 'text', title: 'Lead Paragraph' },
          { type: 'quote', title: 'CEO Statement' },
          { type: 'heading2', title: 'Background and Significance' },
          { type: 'text', title: 'Market Context' },
          { type: 'list', title: 'Key Benefits and Features' },
          { type: 'heading2', title: 'Industry Impact' },
          { type: 'text', title: 'Market Implications' },
          { type: 'quote', title: 'Customer Endorsement' },
          { type: 'heading2', title: 'About the Company' },
          { type: 'text', title: 'Company Boilerplate' }
        ],
        'press_release_executive': [
          { type: 'text', title: 'Executive Summary' },
          { type: 'quote', title: 'CEO Vision Statement' },
          { type: 'heading2', title: 'Strategic Significance' },
          { type: 'text', title: 'Business Impact' },
          { type: 'image', title: 'Leadership Visual' },
          { type: 'video', title: 'Executive Message' },
          { type: 'heading2', title: 'Market Leadership' },
          { type: 'text', title: 'Competitive Advantage' },
          { type: 'list', title: 'Executive Priorities' },
          { type: 'quote', title: 'Industry Recognition' },
          { type: 'heading2', title: 'Future Outlook' },
          { type: 'text', title: 'Strategic Direction' }
        ]
      };

      // Check unified key first for latest HTML, then fallback to legacy
      const unifiedHTMLKey = `preview_html_${foundItem.id}_latest`;
      const legacyHTMLKey = `preview_html_${foundItem.id}`;
      
      let exportedHTML = localStorage.getItem(unifiedHTMLKey);
      let loadedFromUnified = false;
      
      if (exportedHTML) {
        loadedFromUnified = true;
        console.log('✅ UNIFIED PREVIEW: Found HTML in unified key');
      } else {
        console.log('- Unified HTML not found, trying legacy key');
        exportedHTML = localStorage.getItem(legacyHTMLKey);
        
        // Check if legacy HTML has wrong title (cached from old data)
        if (exportedHTML && exportedHTML.includes('AI-Powered Data Export')) {
          console.log('🔧 CLEARING old cached HTML with wrong title');
          localStorage.removeItem(legacyHTMLKey);
          exportedHTML = null;
        }
      }
      
      console.log('🔍 PREVIEW DEBUG: HTML export check');
      console.log('- foundItem.id:', foundItem.id);
      console.log('- unifiedHTMLKey:', unifiedHTMLKey);
      console.log('- legacyHTMLKey:', legacyHTMLKey);
      console.log('- Found exported HTML:', !!exportedHTML);
      console.log('- Loaded from unified:', loadedFromUnified);
      if (exportedHTML) {
        console.log('- HTML preview:', exportedHTML.substring(0, 200) + '...');
      }
      
      let enrichedItem;
      if (exportedHTML) {
        // Use exported HTML directly
        enrichedItem = {
          ...foundItem,
          htmlContent: exportedHTML
        };
        console.log('✅ Using exported HTML content');
      } else {
        // Fallback to old localStorage approach
        const savedContentKey = `content_${foundItem.id}_${foundItem.selected_layout}`;
        const savedContent = localStorage.getItem(savedContentKey);
        console.log('- Fallback: savedContentKey:', savedContentKey);
        console.log('- Fallback: Found saved content:', !!savedContent);
        
        if (savedContent) {
        // Use saved edited content
        try {
          const parsedContent = JSON.parse(savedContent);
          
          // Get the template for this layout to map titles
          const layoutTemplate = layoutContentMap[foundItem.selected_layout] || [];
          
          // Transform edit content structure to preview structure
          const transformedSections = (parsedContent.sections || []).map((section: any, index: number) => {
            const templateSection = layoutTemplate[index];
            let transformedSection = {
              ...section,
              title: templateSection?.title || section.title || `Section ${index + 1}`,
              type: section.type === 'paragraph' ? 'text' : section.type // Map paragraph to text
            };
            
            // Handle video and image metadata transformation
            if (section.type === 'video' && section.metadata?.src) {
              transformedSection.content = section.metadata.src; // Move video URL from metadata to content
            }
            if (section.type === 'image' && section.metadata?.src) {
              transformedSection.imageUrl = section.metadata.src; // Store image URL for rendering
              transformedSection.imageAlt = section.metadata.alt || transformedSection.title;
            }
            
            return transformedSection;
          });
          
          enrichedItem = {
            ...foundItem,
            generated_content: {
              sections: transformedSections
            }
          };
          console.log('Preview: Transformed', transformedSections.length, 'sections from saved content');
        } catch (error) {
          console.warn('Error parsing saved content, using generated content:', error);
          enrichedItem = generateSystematicContent(foundItem);
        }
        } else {
          // Generate systematic content as fallback
          enrichedItem = generateSystematicContent(foundItem);
        }
      }
      
      // Convert to PublishedContent format
      const publishedContent: PublishedContent = {
        id: enrichedItem.id,
        title: updatedContentData?.title || enrichedItem.title,
        content: updatedHTML || enrichedItem.htmlContent || generateContentHTML(enrichedItem),
        type: enrichedItem.type,
        slug: enrichedItem.slug,
        author: enrichedItem.author,
        published_date: enrichedItem.published_date,
        created_date: enrichedItem.created_date,
        feature_title: updatedContentData?.feature_title || enrichedItem.feature_title,
        feature_category: updatedContentData?.feature_category || enrichedItem.feature_category,
        reading_time: enrichedItem.reading_time,
        tags: enrichedItem.tags,
        excerpt: updatedContentData?.description || enrichedItem.excerpt,
        featured_image: updatedContentData?.coverImage || enrichedItem.featured_image,
        selected_layout: enrichedItem.selected_layout,
        layout_completed: enrichedItem.layout_completed,
        generated_content: enrichedItem.generated_content
      };
      
      // Log if using updated content
      if (updatedHTML || updatedContentData) {
        console.log('📖 CONTENT DISPLAY: Using updated content from localStorage');
        console.log('- Updated HTML:', !!updatedHTML);
        console.log('- Updated metadata:', !!updatedContentData);
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setContent(publishedContent);
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Content not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [slug]);

  // Systematic content generator for all layout types
  const generateSystematicContent = (item: any): any => {
    const layoutContentMap: { [key: string]: any[] } = {
      // BLOG LAYOUTS
      'blog_thought_leadership': [
        { type: 'text', title: 'Hook', content: `The ${item.feature_category.toLowerCase()} landscape is experiencing unprecedented transformation driven by AI, machine learning, and real-time processing capabilities.` },
        { type: 'heading2', title: 'Industry Challenge or Trend', content: 'Industry Challenge or Trend' },
        { type: 'text', title: 'Market Analysis', content: `Organizations are struggling to keep pace with evolving ${item.feature_category.toLowerCase()} requirements while maintaining operational efficiency and competitive advantage.` },
        { type: 'image', title: 'Industry Visualization', content: `Industry trends and market analysis for ${item.feature_category}` },
        { type: 'video', title: 'Expert Discussion', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { type: 'heading2', title: 'Our Perspective', content: 'Our Perspective' },
        { type: 'text', title: 'Expert Analysis', content: `Our ${item.feature_title} represents a breakthrough approach to solving these industry challenges through innovative ${item.feature_category.toLowerCase()} capabilities.` },
        { type: 'quote', title: 'Industry Expert Quote', content: `"This innovation in ${item.feature_category.toLowerCase()} will fundamentally change how organizations approach their digital transformation strategies." - Industry Expert` },
        { type: 'heading2', title: 'Practical Implications', content: 'Practical Implications' },
        { type: 'list', title: 'Actionable Takeaways', content: `Implement ${item.feature_category.toLowerCase()} best practices\\nLeverage ${item.feature_title} for competitive advantage\\nDevelop strategic roadmap\\nMeasure and optimize results\\nStay ahead of industry trends` },
        { type: 'text', title: 'Call to Action', content: `Ready to lead in ${item.feature_category.toLowerCase()}? Start with ${item.feature_title} and position your organization at the forefront of industry innovation.` }
      ],

      'blog_behind_scenes': [
        { type: 'text', title: 'Feature Origin Story', content: `The idea for ${item.feature_title} came from a simple observation: our users needed better ${item.feature_category.toLowerCase()} capabilities.` },
        { type: 'heading2', title: 'The Spark of an Idea', content: 'The Spark of an Idea' },
        { type: 'text', title: 'How the Idea Came About', content: `During a critical product meeting, user feedback revealed the urgent need for improved ${item.feature_category.toLowerCase()} functionality that could scale with growing demands.` },
        { type: 'quote', title: 'Team Member Reflection', content: `"The biggest challenge wasn't technical - it was convincing everyone that we needed to rebuild our ${item.feature_category.toLowerCase()} approach from the ground up." - Lead Developer` },
        { type: 'heading2', title: 'Design and Planning', content: 'Design and Planning' },
        { type: 'text', title: 'Design Process', content: `Our design process involved extensive user research and architectural planning to ensure ${item.feature_title} would scale effectively and meet diverse user needs.` },
        { type: 'image', title: 'Design Mockups', content: `Early wireframes and architectural diagrams for ${item.feature_title}` },
        { type: 'video', title: 'Team Interviews', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { type: 'heading2', title: 'Development Challenges', content: 'Development Challenges' },
        { type: 'text', title: 'Technical Obstacles', content: `The biggest technical obstacle was maintaining optimal performance while implementing advanced ${item.feature_category.toLowerCase()} features that users demanded.` },
        { type: 'code', title: 'Technical Solution', content: `const ${item.feature_title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()} = new FeatureEngine({\n  category: "${item.feature_category}",\n  performance: "optimized",\n  scalability: true\n});` },
        { type: 'heading2', title: 'Testing and Refinement', content: 'Testing and Refinement' },
        { type: 'text', title: 'User Testing Process', content: `We conducted extensive beta testing with over 500 users, iterating based on real usage patterns and feedback loops.` },
        { type: 'quote', title: 'Beta User Feedback', content: `"The new ${item.feature_title} is incredible - everything works seamlessly and the interface feels intuitive." - Beta User` },
        { type: 'heading2', title: 'Lessons Learned', content: 'Lessons Learned' },
        { type: 'list', title: 'Key Insights', content: `User-centered design leads to better architecture\\nEarly feedback prevents costly redesigns\\nCross-team collaboration accelerates development\\nPerformance optimization requires ongoing attention\\nScalability must be built from day one` },
        { type: 'text', title: 'What\'s Next', content: `Building ${item.feature_title} taught us valuable lessons about ${item.feature_category.toLowerCase()} development that will inform our next generation of features.` }
      ],

      'blog_comparison': [
        { type: 'text', title: 'Market Landscape Overview', content: `Analysis of the current ${item.feature_category.toLowerCase()} market and where our platform stands among industry leaders.` },
        { type: 'heading2', title: 'The Comparison Criteria', content: 'The Comparison Criteria' },
        { type: 'list', title: 'What We\'re Evaluating', content: `Performance and speed\\nUser experience and interface\\nScalability and reliability\\nIntegration capabilities\\nSecurity features\\nSupport and documentation` },
        { type: 'heading2', title: 'Our Solution', content: 'Our Solution' },
        { type: 'text', title: 'Our Approach', content: `${item.feature_title} represents our innovative approach to ${item.feature_category.toLowerCase()} challenges with unique advantages.` },
        { type: 'image', title: 'Solution Interface', content: `${item.feature_title} user interface and key features` },
        { type: 'video', title: 'Solution Demo', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { type: 'heading2', title: 'Alternative Approaches', content: 'Alternative Approaches' },
        { type: 'text', title: 'How Others Solve This', content: `Traditional ${item.feature_category.toLowerCase()} solutions often fall short in key areas like performance and user experience.` },
        { type: 'heading2', title: 'Head-to-Head Comparison', content: 'Head-to-Head Comparison' },
        { type: 'list', title: 'Feature Breakdown', content: `${item.feature_title}: Advanced architecture\\nCompetitor A: Legacy system limitations\\n${item.feature_title}: Real-time processing\\nCompetitor B: Batch processing only\\n${item.feature_title}: Intuitive interface\\nIndustry Standard: Complex workflows` },
        { type: 'heading2', title: 'Why It Matters', content: 'Why It Matters' },
        { type: 'text', title: 'Impact on Business', content: `The differences in ${item.feature_category.toLowerCase()} capabilities translate directly to business outcomes and competitive advantage.` },
        { type: 'quote', title: 'Customer Perspective', content: `"Switching to this platform was the best decision we made - the difference in ${item.feature_category.toLowerCase()} performance is remarkable." - Customer Success Manager` },
        { type: 'heading2', title: 'Making the Right Choice', content: 'Making the Right Choice' },
        { type: 'text', title: 'Decision Guidance', content: `Organizations should prioritize solutions that offer both immediate benefits and long-term scalability in their ${item.feature_category.toLowerCase()} strategy.` }
      ],

      'blog_howto_guide': [
        { type: 'text', title: 'Introduction', content: `Learn how to implement ${item.feature_title} to improve your ${item.feature_category.toLowerCase()} workflow.` },
        { type: 'video', title: 'Tutorial Overview', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { type: 'text', title: 'What You\'ll Need', content: `Prerequisites and requirements for implementing ${item.feature_title}.` },
        { type: 'text', title: 'Step 1: Getting Started', content: `Begin by configuring your ${item.feature_category.toLowerCase()} environment for optimal performance.` },
        { type: 'image', title: 'Step 1 Screenshot', content: `Initial setup screen for ${item.feature_title}` },
        { type: 'text', title: 'Step 2: Main Implementation', content: `Configure the core ${item.feature_title} settings according to your specific requirements.` },
        { type: 'code', title: 'Configuration Example', content: `// Configure ${item.feature_title}\nconst config = {\n  feature: "${item.feature_title}",\n  category: "${item.feature_category}",\n  enabled: true\n};` },
        { type: 'text', title: 'Step 3: Testing and Verification', content: `Verify that ${item.feature_title} is working correctly in your environment.` },
        { type: 'image', title: 'Expected Results', content: `Expected output after successful ${item.feature_title} implementation` },
        { type: 'text', title: 'Troubleshooting Tips', content: `Common issues and solutions when implementing ${item.feature_title}.` },
        { type: 'quote', title: 'Success Story', content: `Following this guide helped us implement ${item.feature_title} successfully and improved our ${item.feature_category.toLowerCase()} efficiency dramatically.` }
      ],

      // CASE STUDY LAYOUTS
      'case_study_transformation': [
        { type: 'text', title: 'Challenge Overview', content: `Our client faced significant challenges with their existing ${item.feature_category.toLowerCase()} infrastructure and needed a comprehensive solution.` },
        { type: 'video', title: 'Implementation Journey', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { type: 'text', title: 'Solution Implementation', content: `We implemented ${item.feature_title} as part of a comprehensive ${item.feature_category.toLowerCase()} transformation strategy.` },
        { type: 'image', title: 'Before and After Comparison', content: `Visual comparison showing improvement after ${item.feature_title} implementation` },
        { type: 'text', title: 'Measurable Results', content: `The implementation delivered significant improvements in efficiency, performance, and user satisfaction.` },
        { type: 'quote', title: 'Client Testimonial', content: `The transformation exceeded our expectations - ${item.feature_title} has revolutionized our ${item.feature_category.toLowerCase()} operations.` },
        { type: 'text', title: 'Key Success Factors', content: `Success was driven by thorough planning, stakeholder engagement, and phased implementation of ${item.feature_title}.` }
      ],

      'case_study_roi_focused': [
        { type: 'text', title: 'Executive Summary', content: `Comprehensive analysis showing significant ROI achieved through ${item.feature_title} implementation.` },
        { type: 'video', title: 'Financial Impact Visualization', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { type: 'text', title: 'Investment Overview', content: `The client invested in ${item.feature_title} to modernize their ${item.feature_category.toLowerCase()} capabilities.` },
        { type: 'text', title: 'Key Performance Metrics', content: `40% reduction in processing time, 60% improvement in accuracy, and 240% ROI within 18 months.` },
        { type: 'image', title: 'ROI Timeline Chart', content: `Month-by-month ROI progression after ${item.feature_title} implementation` },
        { type: 'text', title: 'Cost Savings Analysis', content: `Direct cost savings from improved ${item.feature_category.toLowerCase()} efficiency and reduced manual processes.` },
        { type: 'quote', title: 'Financial Officer Quote', content: `The ROI from ${item.feature_title} exceeded our projections - it's been one of our most successful technology investments.` },
        { type: 'text', title: 'Implementation Timeline', content: `Month-by-month breakdown of implementation milestones and corresponding business impact.` }
      ],

      // PRESS RELEASE LAYOUTS  
      'press_release_announcement': [
        { type: 'text', title: 'Lead Paragraph', content: `Today we announce the launch of ${item.feature_title}, setting new industry standards for ${item.feature_category.toLowerCase()} solutions. This breakthrough technology addresses critical market needs and positions our company as a leader in innovative ${item.feature_category.toLowerCase()}.` },
        { type: 'quote', title: 'CEO Statement', content: `"${item.feature_title} represents our commitment to innovation in ${item.feature_category.toLowerCase()} and will help organizations achieve new levels of efficiency. This launch marks a significant milestone in our company's growth." - CEO` },
        { type: 'heading2', title: 'Background and Significance', content: 'Background and Significance' },
        { type: 'text', title: 'Market Context', content: `The ${item.feature_category.toLowerCase()} market has been seeking advanced solutions that can deliver both performance and reliability. ${item.feature_title} addresses these challenges through innovative technology and user-centered design.` },
        { type: 'list', title: 'Key Benefits and Features', content: `Advanced ${item.feature_category.toLowerCase()} capabilities\nSeamless integration with existing systems\nImproved performance and reliability\nEnterprise-grade security\nScalable architecture` },
        { type: 'heading2', title: 'Industry Impact', content: 'Industry Impact' },
        { type: 'text', title: 'Market Implications', content: `This launch is expected to accelerate adoption of ${item.feature_category.toLowerCase()} solutions across enterprise markets. Industry analysts predict significant market growth driven by innovations like ${item.feature_title}.` },
        { type: 'quote', title: 'Customer Endorsement', content: `"We've been beta testing ${item.feature_title} and the results have exceeded our expectations. This technology has transformed our ${item.feature_category.toLowerCase()} operations." - Enterprise Customer` },
        { type: 'heading2', title: 'About the Company', content: 'About the Company' },
        { type: 'text', title: 'Company Boilerplate', content: `Our company is a leading provider of ${item.feature_category.toLowerCase()} solutions, serving enterprise customers worldwide. We are committed to innovation and helping organizations achieve their digital transformation goals through cutting-edge technology.` }
      ],

      // NEWSLETTER LAYOUTS
      'newsletter_focused': [
        { type: 'text', title: 'Feature Introduction', content: `This month we spotlight ${item.feature_title}, our breakthrough innovation in ${item.feature_category.toLowerCase()} that's transforming how teams work.` },
        { type: 'heading2', title: 'Feature Deep Dive', content: 'Feature Deep Dive' },
        { type: 'text', title: 'Detailed Feature Explanation', content: `${item.feature_title} leverages advanced technology to deliver superior ${item.feature_category.toLowerCase()} capabilities, providing unprecedented performance and user experience.` },
        { type: 'image', title: 'Feature Demo Screenshot', content: `${item.feature_title} interface and key features demonstration` },
        { type: 'video', title: 'Tutorial Walkthrough', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { type: 'heading2', title: 'How to Get Started', content: 'How to Get Started' },
        { type: 'list', title: 'Step-by-Step Tutorial', content: `Enable ${item.feature_title} in your settings\\nConnect your data sources\\nConfigure your preferences\\nStart analyzing results\\nShare insights with your team` },
        { type: 'heading2', title: 'Pro Tips', content: 'Pro Tips' },
        { type: 'list', title: 'Advanced Usage Tips', content: `Use keyboard shortcuts for faster navigation\\nSet up automated workflows\\nCustomize dashboards for your role\\nIntegrate with existing tools\\nSchedule regular reports` },
        { type: 'quote', title: 'Power User Testimonial', content: `"${item.feature_title} has completely transformed our ${item.feature_category.toLowerCase()} workflow. We're seeing 300% better results and our team productivity has skyrocketed." - Senior ${item.feature_category} Manager` },
        { type: 'text', title: 'Resources and Next Steps', content: `Ready to get started with ${item.feature_title}? Check out our comprehensive documentation, join our community forum, and don't forget to follow us for the latest updates and feature announcements.` }
      ]
    };

    // Get the layout template or use a default
    const layoutSections = layoutContentMap[item.selected_layout] || [
      { type: 'text', title: 'Overview', content: `Introduction to ${item.feature_title} and its ${item.feature_category.toLowerCase()} capabilities.` },
      { type: 'video', title: 'Demo Video', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { type: 'text', title: 'Key Benefits', content: `${item.feature_title} delivers significant improvements in ${item.feature_category.toLowerCase()} performance.` }
    ];

    return {
      ...item,
      generated_content: { sections: layoutSections }
    };
  };

  const generateContentHTML = (item: any): string => {
    if (!item.generated_content || !item.generated_content.sections) {
      return `
        <div class="mb-8">
          <img src="${item.featured_image}" alt="${item.title}" class="w-full h-64 object-cover rounded-lg mb-6" />
          <p class="text-lg text-gray-700 leading-relaxed">${item.description}</p>
        </div>
      `;
    }

    let html = '';
    
    // Add featured image at the top if available
    if (item.featured_image && item.featured_image !== '/api/placeholder/400/240') {
      html += `<div class="mb-8"><img src="${item.featured_image}" alt="${item.title}" class="w-full h-64 object-cover rounded-lg shadow-lg" /></div>`;
    }
    
    item.generated_content.sections.forEach((section: any, index: number) => {
      switch (section.type) {
        case 'text':
          html += `
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">${section.title}</h2>
              <p class="text-lg text-gray-700 leading-relaxed">${section.content}</p>
            </div>
          `;
          break;
        case 'video':
          // Check if content is a YouTube URL
          const isYouTubeUrl = section.content.includes('youtube.com') || section.content.includes('youtu.be');
          
          if (isYouTubeUrl) {
            html += `
              <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">${section.title}</h2>
                <div class="aspect-video rounded-lg overflow-hidden shadow-lg">
                  <iframe 
                    src="${section.content}" 
                    title="${section.title}"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    class="w-full h-full"
                  ></iframe>
                </div>
              </div>
            `;
          } else {
            html += `
              <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">${section.title}</h2>
                <div class="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl border border-blue-200 text-center">
                  <div class="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-blue-900 mb-2">Video Content</h3>
                  <p class="text-blue-700">${section.content}</p>
                  <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    ▶ Play Video
                  </button>
                </div>
              </div>
            `;
          }
          break;
        case 'quote':
          html += `
            <div class="mb-8">
              <blockquote class="bg-gray-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                <p class="text-xl italic text-gray-800 mb-4">"${section.content}"</p>
                <cite class="text-sm font-medium text-gray-600">— Customer Success Story</cite>
              </blockquote>
            </div>
          `;
          break;
        case 'code':
          html += `
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">${section.title}</h2>
              <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre class="text-green-400 text-sm font-mono"><code>${section.content}</code></pre>
              </div>
            </div>
          `;
          break;
        case 'image':
          if (section.imageUrl) {
            // Render actual image if URL is provided
            html += `
              <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">${section.title}</h2>
                <div class="rounded-lg overflow-hidden shadow-lg">
                  <img src="${section.imageUrl}" alt="${section.imageAlt || section.title}" class="w-full h-auto object-cover" />
                </div>
                ${section.content ? `<p class="text-gray-600 mt-4 text-center italic">${section.content}</p>` : ''}
              </div>
            `;
          } else {
            // Show placeholder if no image URL
            html += `
              <div class="mb-8">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">${section.title}</h2>
                <div class="bg-gray-100 p-8 rounded-xl border-2 border-dashed border-gray-300 text-center">
                  <div class="w-16 h-16 mx-auto mb-4 bg-gray-400 rounded-lg flex items-center justify-center">
                    <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-700 mb-2">Image Placeholder</h3>
                  <p class="text-gray-600">${section.content}</p>
                </div>
              </div>
            `;
          }
          break;
        case 'list':
          const listItems = section.content.split('\n').filter((item: string) => item.trim().length > 0);
          html += `
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">${section.title}</h2>
              <ul class="space-y-2">
                ${listItems.map((item: string) => `<li class="flex items-start space-x-2"><span class="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span><span class="text-gray-700">${item.trim()}</span></li>`).join('')}
              </ul>
            </div>
          `;
          break;
        case 'heading2':
          html += `
            <div class="mb-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">${section.content}</h2>
            </div>
          `;
          break;
        default:
          html += `
            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-4">${section.title}</h2>
              <p class="text-lg text-gray-700 leading-relaxed">${section.content}</p>
            </div>
          `;
      }
    });

    return html;
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
    <div className="min-h-screen bg-white pt-6">
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
                  {content.selected_layout && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                        Layout: {content.selected_layout.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </>
                  )}
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
              <span>{formatDate(content.published_date || content.created_date)}</span>
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
        {/* Render the content HTML directly */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: content.content
          }}
        />
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