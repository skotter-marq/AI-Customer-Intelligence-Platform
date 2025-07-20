'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Search,
  Sparkles,
  Copy,
  Download,
  Save,
  Users,
  BookOpen,
  Share2,
  Edit,
  Mail,
  FileText,
  Globe,
  MessageSquare,
  X,
  ExternalLink,
  GitBranch,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  Image,
  Video,
  Plus,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  Type,
  Play,
  Link,
  Bold,
  Italic,
  List,
  Hash
} from 'lucide-react';

interface ProductFeature {
  id: string;
  title: string;
  description: string;
  source: 'jira' | 'changelog';
  status: 'released' | 'in_development' | 'planned';
  release_date?: string;
  jira_key?: string;
  category: string;
  impact: 'high' | 'medium' | 'low';
  customer_facing: boolean;
  technical_details: string;
  business_value: string;
  target_users: string[];
  metrics?: {
    usage_increase?: string;
    time_savings?: string;
    error_reduction?: string;
    customer_satisfaction?: string;
  };
}

interface ContentTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  estimatedTime: string;
}

interface ContentLayout {
  id: string;
  name: string;
  description: string;
  contentTypes: string[]; // which content types this layout applies to
  contentPrompt: string; // how to apply product feature data to this layout
  sections: Array<{
    type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'image' | 'video' | 'list' | 'quote' | 'code' | 'divider';
    placeholder: string;
  }>;
  estimatedLength: string;
}

interface ContentSection {
  id: string;
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'image' | 'video' | 'list' | 'quote' | 'code' | 'divider';
  content: string;
  metadata?: {
    level?: number; // for headings
    src?: string; // for images/videos
    alt?: string; // for images
    items?: string[]; // for lists
    author?: string; // for quotes
    language?: string; // for code
  };
}

interface RichContent {
  title: string;
  subtitle?: string;
  coverImage?: string;
  sections: ContentSection[];
  metadata: {
    author: string;
    readTime: number;
    tags: string[];
    category: string;
  };
}

export default function CreateContentPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<ProductFeature | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<ContentLayout | null>(null);

  // Helper function to update template and URL
  const updateSelectedTemplate = (template: ContentTemplate) => {
    // Show regenerate notification if content exists and this is a different template
    if (contentGenerated && selectedTemplate && selectedTemplate.id !== template.id) {
      setShowRegenerateNotification(true);
      console.log('🔄 TEMPLATE CHANGE: Showing regenerate notification');
    }

    setSelectedTemplate(template);
    // Reset layout selection when changing content type
    setSelectedLayout(null);
    // Update URL with new content type
    if (editingId) {
      const currentUrl = new URL(window.location.href);
      console.log('🔄 BEFORE URL update:', currentUrl.toString());
      currentUrl.searchParams.set('type', template.type);
      // Remove layout from URL since we're changing content type
      currentUrl.searchParams.delete('selected_layout');
      window.history.replaceState({}, '', currentUrl.toString());
      console.log('🔄 AFTER URL update:', currentUrl.toString());
      console.log('🔄 Updated URL content type to:', template.type);
    }
  };

  // Helper function to update layout and URL
  const updateSelectedLayout = (layout: ContentLayout) => {
    // Show regenerate notification if content exists and this is a different layout
    if (contentGenerated && selectedLayout && selectedLayout.id !== layout.id) {
      setShowRegenerateNotification(true);
      console.log('🔄 LAYOUT CHANGE: Showing regenerate notification');
    }

    setSelectedLayout(layout);
    // Update URL with new layout
    if (editingId) {
      const currentUrl = new URL(window.location.href);
      console.log('🔄 BEFORE layout URL update:', currentUrl.toString());
      currentUrl.searchParams.set('selected_layout', layout.id);
      window.history.replaceState({}, '', currentUrl.toString());
      console.log('🔄 AFTER layout URL update:', currentUrl.toString());
      console.log('🔄 Updated URL layout to:', layout.id);
    }
  };

  // Helper function to update feature selection
  const updateSelectedFeature = (feature: ProductFeature) => {
    // Show regenerate notification if content exists and this is a different feature
    if (contentGenerated && selectedFeature && selectedFeature.id !== feature.id) {
      setShowRegenerateNotification(true);
      console.log('🔄 FEATURE CHANGE: Showing regenerate notification');
    }

    setSelectedFeature(feature);
  };

  const [featureSearch, setFeatureSearch] = useState('');
  const [richContent, setRichContent] = useState<RichContent | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showRichEditor, setShowRichEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contentGenerated, setContentGenerated] = useState(false);
  const [focusedSectionId, setFocusedSectionId] = useState<string | null>(null);
  
  // Collapsible steps state - collapsed by default in edit mode
  const [stepsCollapsed, setStepsCollapsed] = useState({
    step1: false, // Will be set to true in edit mode
    step2: false,
    step3: false
  });

  // Publish status - will be set based on content data
  const [publishStatus, setPublishStatus] = useState<'draft' | 'published'>('draft');

  // Track if page is still initializing (kept for potential future use)
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Auto-save richContent to localStorage whenever it changes
  useEffect(() => {
    if (richContent && editingId && selectedLayout) {
      // Use unified key for all content saves
      const unifiedKey = `content_${editingId}_latest`;
      const legacyKey = `content_${editingId}_${selectedLayout.id}`;
      
      const contentToSave = {
        title: richContent.title,
        subtitle: richContent.subtitle,
        coverImage: richContent.coverImage,
        sections: richContent.sections,
        metadata: richContent.metadata,
        lastSaved: new Date().toISOString(),
        // Store current layout and content type for sync
        currentLayout: selectedLayout.id,
        currentContentType: selectedLayout.contentTypes[0], // Primary content type
        layoutName: selectedLayout.name
      };
      
      try {
        // Save to unified key (primary source of truth)
        localStorage.setItem(unifiedKey, JSON.stringify(contentToSave));
        
        // Also save to legacy key for backward compatibility
        localStorage.setItem(legacyKey, JSON.stringify(contentToSave));
        
        console.log('✅ UNIFIED SAVE: Content saved to both keys');
        console.log('- Unified key:', unifiedKey);
        console.log('- Legacy key:', legacyKey);
        console.log('- Layout:', selectedLayout.id, selectedLayout.name);
        console.log('- Content type:', selectedLayout.contentTypes[0]);
        console.log('- Sections count:', contentToSave.sections.length);
        
        // Auto-export HTML for preview
        exportForPreview();
      } catch (error) {
        console.warn('Failed to save content to localStorage:', error);
      }
    }
  }, [richContent, editingId, selectedLayout]);
  const [showRegenerateNotification, setShowRegenerateNotification] = useState(false);
  
  // Refs for scrolling to focused sections
  const editSectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const previewSectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Auto-scroll refs for new content creation
  const step2Ref = useRef<HTMLDivElement | null>(null);
  const step3Ref = useRef<HTMLDivElement | null>(null);
  const generateButtonRef = useRef<HTMLDivElement | null>(null);
  const generatedContentRef = useRef<HTMLDivElement | null>(null);

  // Function to focus on a specific section and scroll to it
  const focusSection = (sectionId: string, scrollToEdit: boolean = true, scrollToPreview: boolean = true) => {
    setFocusedSectionId(sectionId);
    
    // Scroll to the section in the edit panel
    if (scrollToEdit && editSectionRefs.current[sectionId]) {
      editSectionRefs.current[sectionId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
    
    // Scroll to the section in the preview panel
    if (scrollToPreview && previewSectionRefs.current[sectionId]) {
      previewSectionRefs.current[sectionId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // Auto-scroll functionality removed

  useEffect(() => {
    // Check if we're editing an existing content item
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    const contentType = urlParams.get('type');
    const title = urlParams.get('title');
    const description = urlParams.get('description');
    const featureId = urlParams.get('feature');
    const step3Complete = urlParams.get('step3_complete') === 'true';
    const selectedLayoutId = urlParams.get('selected_layout');
    
    if (editId) {
      setEditingId(editId);
      
      // Collapse setup steps in edit mode to focus on content editing
      setStepsCollapsed({
        step1: true,
        step2: true, 
        step3: true
      });

      // Set initial publish status - for now defaulting to draft in edit mode
      // In a real app, this would come from the content data
      setPublishStatus('draft');
      
      // Auto-select template based on content type
      if (contentType) {
        const typeMapping: Record<string, string> = {
          'changelog': 'blog',
          'email': 'newsletter',
          'social': 'blog',
          'case_study': 'case_study',
          'blog': 'blog',
          'press_release': 'press_release',
          'newsletter': 'newsletter',
          'video': 'video'
        };
        
        const mappedType = typeMapping[contentType] || contentType;
        const template = contentTemplates.find(t => t.type === mappedType);
        if (template) {
          setSelectedTemplate(template);
        } else {
          console.warn('No template found for content type:', contentType, 'mapped to:', mappedType);
        }
      }
      
      // Auto-select feature if specified
      if (featureId) {
        const feature = productFeatures.find(f => f.id === featureId);
        if (feature) {
          setSelectedFeature(feature);
        }
      }
      
      // Auto-select layout if specified and step 3 is complete
      if (step3Complete && selectedLayoutId) {
        console.log('DEBUG: Layout selection for edit mode:');
        console.log('- Full URL:', window.location.href);
        console.log('- URL Search Params:', window.location.search);
        console.log('- editId:', editId);
        console.log('- selectedLayoutId from URL:', selectedLayoutId);
        console.log('- contentType:', contentType);
        console.log('- step3Complete:', step3Complete);
        
        // Use setTimeout to ensure layouts are loaded
        setTimeout(() => {
          const layout = contentLayouts.find(l => l.id === selectedLayoutId);
          console.log('- Found layout:', layout ? layout.id : 'NOT FOUND');
          console.log('- Available layouts:', contentLayouts.map(l => l.id));
          
          if (layout) {
            setSelectedLayout(layout);
            console.log('- Set selectedLayout to:', layout.id);
            // Since this is existing content, mark as content generated
            setContentGenerated(true);
            
            // Try to load saved content from unified key first, then fallback to layout-specific key
            const unifiedKey = `content_${editId}_latest`;
            const legacyKey = `content_${editId}_${selectedLayoutId}`;
            
            console.log('- Looking for saved content with unified key:', unifiedKey);
            let savedContent = localStorage.getItem(unifiedKey);
            let loadedFromUnified = false;
            
            if (savedContent) {
              loadedFromUnified = true;
              console.log('✅ UNIFIED LOAD: Found content in unified key');
            } else {
              console.log('- Unified key not found, trying legacy key:', legacyKey);
              savedContent = localStorage.getItem(legacyKey);
              if (savedContent) {
                console.log('✅ LEGACY LOAD: Found content in legacy key');
              }
            }
            
            if (savedContent) {
              try {
                const parsedContent = JSON.parse(savedContent);
                const richContent: RichContent = {
                  title: title || parsedContent.title || 'Untitled', // Prioritize URL title
                  subtitle: description || parsedContent.subtitle || '',
                  coverImage: parsedContent.coverImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
                  sections: parsedContent.sections || [],
                  metadata: parsedContent.metadata || {
                    author: 'Product Team',
                    readingTime: '5 min read',
                    tags: ['Product Update'],
                    category: 'Product Updates'
                  }
                };
                setRichContent(richContent);

                // If title changed from URL, update the saved content to prevent false regeneration triggers
                if (title && title !== parsedContent.title) {
                  console.log('🔄 TITLE SYNC: Updating saved title to match URL');
                  const updatedContent = { ...parsedContent, title: title };
                  try {
                    localStorage.setItem(unifiedKey, JSON.stringify(updatedContent));
                    if (legacyKey) {
                      localStorage.setItem(legacyKey, JSON.stringify(updatedContent));
                    }
                  } catch (error) {
                    console.warn('Failed to update saved title:', error);
                  }
                }
                
                // If loaded from unified key, update current layout and content type
                if (loadedFromUnified && parsedContent.currentLayout && parsedContent.currentContentType) {
                  console.log('🔄 SYNC: Updating to latest layout from unified save');
                  console.log('- Latest layout:', parsedContent.currentLayout);
                  console.log('- Latest content type:', parsedContent.currentContentType);
                  
                  // Find and set the actual layout object
                  const latestLayout = contentLayouts.find(l => l.id === parsedContent.currentLayout);
                  if (latestLayout) {
                    setSelectedLayout(latestLayout);
                    console.log('- Updated selectedLayout to:', latestLayout.id, latestLayout.name);
                  }
                  
                  // Update selected template based on content type
                  const latestTemplate = contentTemplates.find(t => t.type === parsedContent.currentContentType);
                  if (latestTemplate) {
                    setSelectedTemplate(latestTemplate);
                    console.log('- Updated selectedTemplate to:', latestTemplate.type);
                  }
                }
                
                console.log('✅ Content loaded from:', loadedFromUnified ? 'unified key' : 'legacy key');
                console.log('🔧 DEBUG: Using URL title:', title, 'over cached title:', parsedContent.title);
              } catch (error) {
                console.warn('Error loading saved content, generating new:', error);
                // Generate the rich content systematically based on layout
                generateSystematicContentForEdit(layout, featureId, contentType, title, description);
              }
            } else {
              // Generate the rich content systematically based on layout
              generateSystematicContentForEdit(layout, featureId, contentType, title, description);
              console.log('Edit: Generated new content for edit mode, will auto-save when richContent updates');
            }
          }
        }, 100);
      }
    }

    // Mark initial load as complete after a short delay to ensure all state is set
    setTimeout(() => {
      setIsInitialLoad(false);
    }, 200);
  }, []);

  // Function to auto-scroll to the next step (only in create mode, not edit mode)
  const scrollToStep = (stepRef: React.RefObject<HTMLDivElement | null>, delay: number = 500) => {
    // Only auto-scroll when creating new content (not editing existing)
    if (!editingId) {
      setTimeout(() => {
        stepRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, delay);
    }
  };

  // Auto-scroll when template is selected (step 1 → step 2) - only for new content creation
  useEffect(() => {
    if (selectedTemplate && step2Ref.current && !contentGenerated && !editingId) {
      scrollToStep(step2Ref);
    }
  }, [selectedTemplate, editingId]);

  // Auto-scroll when feature is selected (step 2 → step 3) - only for new content creation
  useEffect(() => {
    if (selectedFeature && selectedTemplate && step3Ref.current && !contentGenerated && !editingId) {
      scrollToStep(step3Ref);
    }
  }, [selectedFeature, selectedTemplate, editingId]);

  // Auto-scroll when layout is selected (step 3 → Generate button) - only for new content creation
  useEffect(() => {
    if (selectedLayout && selectedFeature && selectedTemplate && generateButtonRef.current && !contentGenerated && !editingId) {
      scrollToStep(generateButtonRef);
    }
  }, [selectedLayout, selectedFeature, selectedTemplate, editingId]);

  // Auto-scroll to generated content section after content is generated - only for new content creation
  useEffect(() => {
    if (contentGenerated && generatedContentRef.current && !editingId) {
      scrollToStep(generatedContentRef, 1000); // Longer delay to let content render
    }
  }, [contentGenerated, editingId]);

  const contentTemplates: ContentTemplate[] = [
    {
      id: 'blog_post',
      name: 'Blog Post',
      type: 'blog',
      description: 'Professional blog post with rich content, images, and SEO optimization',
      icon: BookOpen,
      color: 'blue',
      estimatedTime: '15-30 min'
    },
    {
      id: 'case_study',
      name: 'Case Study',
      type: 'case_study',
      description: 'Detailed customer success story with metrics, testimonials, and results',
      icon: Users,
      color: 'purple',
      estimatedTime: '20-40 min'
    },
    {
      id: 'press_release',
      name: 'Press Release',
      type: 'press_release',
      description: 'Official company announcement for media distribution and coverage',
      icon: Globe,
      color: 'orange',
      estimatedTime: '30-45 min'
    },
    {
      id: 'newsletter',
      name: 'Newsletter',
      type: 'newsletter',
      description: 'Company newsletter with product updates, insights, and company news',
      icon: FileText,
      color: 'teal',
      estimatedTime: '20-30 min'
    }
  ];

  const contentLayouts: ContentLayout[] = [
    // BLOG POST LAYOUTS
    {
      id: 'blog_thought_leadership',
      name: 'Thought Leadership',
      description: 'In-depth analysis with expert insights and industry perspective',
      contentTypes: ['blog'],
      contentPrompt: 'Position this feature as part of broader industry trends. Analyze the market challenge, explain how this feature represents innovation, and provide expert perspective on its significance. Focus on thought leadership and industry implications.',
      sections: [
        { type: 'paragraph', placeholder: 'Hook - compelling opening statement' },
        { type: 'heading2', placeholder: 'Industry challenge or trend' },
        { type: 'paragraph', placeholder: 'Market analysis and context' },
        { type: 'image', placeholder: 'Industry or trend visualization' },
        { type: 'video', placeholder: 'Expert discussion or industry overview video (optional)' },
        { type: 'heading2', placeholder: 'Our perspective' },
        { type: 'paragraph', placeholder: 'Expert analysis and insights' },
        { type: 'quote', placeholder: 'Industry expert or customer quote' },
        { type: 'heading2', placeholder: 'Practical implications' },
        { type: 'list', placeholder: 'Actionable takeaways' },
        { type: 'paragraph', placeholder: 'Call to action for readers' }
      ],
      estimatedLength: '1000-1200 words'
    },
    {
      id: 'blog_product_showcase',
      name: 'Product Showcase',
      description: 'Visual-rich feature announcement with screenshots and demos',
      contentTypes: ['blog'],
      contentPrompt: 'Create an exciting announcement showcasing the feature\'s capabilities. Focus on visual elements, user benefits, and demonstrate the feature in action. Include customer feedback and practical getting-started guidance.',
      sections: [
        { type: 'paragraph', placeholder: 'Feature announcement and excitement' },
        { type: 'image', placeholder: 'Hero product screenshot' },
        { type: 'video', placeholder: 'Product demo video URL (optional)' },
        { type: 'heading2', placeholder: 'What\'s new' },
        { type: 'list', placeholder: 'Key features and improvements' },
        { type: 'heading2', placeholder: 'How it works' },
        { type: 'paragraph', placeholder: 'Feature explanation' },
        { type: 'image', placeholder: 'Step-by-step screenshot' },
        { type: 'video', placeholder: 'Tutorial video URL (optional)' },
        { type: 'heading2', placeholder: 'Customer impact' },
        { type: 'quote', placeholder: 'Beta user testimonial' },
        { type: 'paragraph', placeholder: 'Getting started guide' }
      ],
      estimatedLength: '800-1000 words'
    },
    {
      id: 'blog_howto_guide',
      name: 'How-To Guide',
      description: 'Step-by-step tutorial with practical examples and tips',
      contentTypes: ['blog'],
      contentPrompt: 'Create a comprehensive tutorial showing users exactly how to use this feature. Break down implementation into clear steps, include code examples and troubleshooting, and share real user success stories.',
      sections: [
        { type: 'paragraph', placeholder: 'Introduction to the problem/goal' },
        { type: 'video', placeholder: 'Tutorial overview or demo video (optional)' },
        { type: 'heading2', placeholder: 'What you\'ll need' },
        { type: 'list', placeholder: 'Prerequisites and requirements' },
        { type: 'heading2', placeholder: 'Step 1: Getting started' },
        { type: 'paragraph', placeholder: 'First step explanation' },
        { type: 'image', placeholder: 'Step 1 screenshot/illustration' },
        { type: 'heading2', placeholder: 'Step 2: Main implementation' },
        { type: 'paragraph', placeholder: 'Detailed step instructions' },
        { type: 'code', placeholder: 'Code example or configuration' },
        { type: 'heading2', placeholder: 'Step 3: Testing and verification' },
        { type: 'paragraph', placeholder: 'How to verify it works' },
        { type: 'image', placeholder: 'Expected results screenshot' },
        { type: 'heading2', placeholder: 'Troubleshooting tips' },
        { type: 'list', placeholder: 'Common issues and solutions' },
        { type: 'quote', placeholder: 'Success story from user' }
      ],
      estimatedLength: '1200-1400 words'
    },
    {
      id: 'blog_comparison',
      name: 'Comparison & Analysis',
      description: 'Feature comparison with competitors or alternatives',
      contentTypes: ['blog'],
      contentPrompt: 'Compare this feature against alternative solutions or previous approaches. Analyze the unique advantages, technical differentiators, and business value. Help readers understand why this approach is superior.',
      sections: [
        { type: 'paragraph', placeholder: 'Market landscape overview' },
        { type: 'heading2', placeholder: 'The comparison criteria' },
        { type: 'list', placeholder: 'What we\'re evaluating' },
        { type: 'heading2', placeholder: 'Our solution' },
        { type: 'paragraph', placeholder: 'Our approach and strengths' },
        { type: 'image', placeholder: 'Our solution interface' },
        { type: 'video', placeholder: 'Solution comparison demo (optional)' },
        { type: 'heading2', placeholder: 'Alternative approaches' },
        { type: 'paragraph', placeholder: 'How others solve this problem' },
        { type: 'heading2', placeholder: 'Head-to-head comparison' },
        { type: 'list', placeholder: 'Feature-by-feature breakdown' },
        { type: 'heading2', placeholder: 'Why it matters' },
        { type: 'paragraph', placeholder: 'Impact on users and business' },
        { type: 'quote', placeholder: 'Customer perspective on differences' },
        { type: 'heading2', placeholder: 'Making the right choice' },
        { type: 'paragraph', placeholder: 'Guidance for decision makers' }
      ],
      estimatedLength: '1100-1300 words'
    },
    {
      id: 'blog_behind_scenes',
      name: 'Behind the Scenes',
      description: 'Development story with team insights and challenges',
      contentTypes: ['blog'],
      contentPrompt: 'Tell the human story behind this feature\'s development. Share the original problem that sparked the idea, design decisions, technical challenges overcome, and team insights. Make it personal and relatable.',
      sections: [
        { type: 'paragraph', placeholder: 'Feature origin story' },
        { type: 'heading2', placeholder: 'The spark of an idea' },
        { type: 'paragraph', placeholder: 'How the idea came about' },
        { type: 'quote', placeholder: 'Team member reflection' },
        { type: 'heading2', placeholder: 'Design and planning' },
        { type: 'paragraph', placeholder: 'Design process and decisions' },
        { type: 'image', placeholder: 'Design mockups or wireframes' },
        { type: 'video', placeholder: 'Team interviews or development process (optional)' },
        { type: 'heading2', placeholder: 'Development challenges' },
        { type: 'paragraph', placeholder: 'Technical obstacles faced' },
        { type: 'code', placeholder: 'Interesting technical solution' },
        { type: 'heading2', placeholder: 'Testing and refinement' },
        { type: 'paragraph', placeholder: 'User testing and iteration' },
        { type: 'quote', placeholder: 'Beta user feedback' },
        { type: 'heading2', placeholder: 'Lessons learned' },
        { type: 'list', placeholder: 'Key insights and takeaways' },
        { type: 'paragraph', placeholder: 'What\'s next for the feature' }
      ],
      estimatedLength: '900-1100 words'
    },
    
    // CASE STUDY LAYOUTS
    {
      id: 'case_study_transformation',
      name: 'Customer Transformation',
      description: 'Complete customer journey from challenge to success',
      contentTypes: ['case_study'],
      contentPrompt: 'Tell the complete customer success story from initial challenge through implementation to measurable results. Focus on the transformation achieved and quantifiable business impact.',
      sections: [
        { type: 'quote', placeholder: 'Powerful customer success quote' },
        { type: 'heading2', placeholder: 'Customer background' },
        { type: 'paragraph', placeholder: 'Company profile and context' },
        { type: 'video', placeholder: 'Customer introduction video (optional)' },
        { type: 'heading2', placeholder: 'The challenge' },
        { type: 'paragraph', placeholder: 'Detailed problem description' },
        { type: 'list', placeholder: 'Specific pain points' },
        { type: 'heading2', placeholder: 'The solution' },
        { type: 'paragraph', placeholder: 'Implementation approach' },
        { type: 'image', placeholder: 'Solution diagram or screenshot' },
        { type: 'video', placeholder: 'Solution demo video (optional)' },
        { type: 'heading2', placeholder: 'Results achieved' },
        { type: 'list', placeholder: 'Quantified outcomes and metrics' },
        { type: 'quote', placeholder: 'Final customer testimonial' }
      ],
      estimatedLength: '1200-1500 words'
    },
    {
      id: 'case_study_technical',
      name: 'Technical Implementation',
      description: 'Developer-focused case study with code and architecture',
      contentTypes: ['case_study'],
      contentPrompt: 'Focus on the technical aspects of implementation. Detail the architecture, integration challenges, code examples, and technical performance improvements achieved.',
      sections: [
        { type: 'paragraph', placeholder: 'Technical challenge introduction' },
        { type: 'heading2', placeholder: 'Technical requirements' },
        { type: 'list', placeholder: 'Specific technical needs' },
        { type: 'heading2', placeholder: 'Architecture overview' },
        { type: 'paragraph', placeholder: 'Solution architecture explanation' },
        { type: 'code', placeholder: 'Implementation code sample' },
        { type: 'video', placeholder: 'Technical walkthrough or architecture demo (optional)' },
        { type: 'heading2', placeholder: 'Integration process' },
        { type: 'paragraph', placeholder: 'Step-by-step implementation' },
        { type: 'image', placeholder: 'Architecture diagram' },
        { type: 'heading2', placeholder: 'Performance results' },
        { type: 'list', placeholder: 'Technical metrics and improvements' },
        { type: 'quote', placeholder: 'Technical team feedback' }
      ],
      estimatedLength: '1000-1300 words'
    },
    {
      id: 'case_study_roi_focused',
      name: 'ROI & Metrics Focus',
      description: 'Numbers-driven case study emphasizing financial impact',
      contentTypes: ['case_study'],
      contentPrompt: 'Emphasize quantifiable business value and financial impact. Focus on ROI metrics, cost savings, revenue impact, and measurable performance improvements.',
      sections: [
        { type: 'paragraph', placeholder: 'Executive summary with key metrics' },
        { type: 'heading2', placeholder: 'Company overview' },
        { type: 'paragraph', placeholder: 'Client background and industry context' },
        { type: 'heading2', placeholder: 'Business challenges' },
        { type: 'list', placeholder: 'Specific problems and costs' },
        { type: 'heading2', placeholder: 'Solution implementation' },
        { type: 'paragraph', placeholder: 'What was deployed and how' },
        { type: 'image', placeholder: 'Implementation timeline or diagram' },
        { type: 'heading2', placeholder: 'Measurable results' },
        { type: 'list', placeholder: 'Quantified outcomes and ROI metrics' },
        { type: 'video', placeholder: 'Customer interview on financial impact (optional)' },
        { type: 'heading2', placeholder: 'Financial impact' },
        { type: 'paragraph', placeholder: 'Cost savings and revenue impact' },
        { type: 'quote', placeholder: 'CFO or finance leader testimonial' },
        { type: 'heading2', placeholder: 'Ongoing value' },
        { type: 'paragraph', placeholder: 'Long-term benefits and projections' }
      ],
      estimatedLength: '1000-1200 words'
    },
    {
      id: 'case_study_before_after',
      name: 'Before & After Showcase',
      description: 'Visual transformation story with clear comparisons',
      contentTypes: ['case_study'],
      contentPrompt: 'Create a compelling visual narrative showing the dramatic transformation. Use before/after comparisons, metrics, and visual evidence to demonstrate the impact.',
      sections: [
        { type: 'quote', placeholder: 'Dramatic transformation quote' },
        { type: 'heading2', placeholder: 'The situation before' },
        { type: 'paragraph', placeholder: 'Detailed problem description' },
        { type: 'image', placeholder: 'Before: current state screenshot/photo' },
        { type: 'list', placeholder: 'Specific pain points and challenges' },
        { type: 'heading2', placeholder: 'The transformation process' },
        { type: 'paragraph', placeholder: 'How the change was implemented' },
        { type: 'video', placeholder: 'Transformation timeline or customer testimonial (optional)' },
        { type: 'heading2', placeholder: 'The situation after' },
        { type: 'paragraph', placeholder: 'New state and improvements' },
        { type: 'image', placeholder: 'After: transformed state screenshot/photo' },
        { type: 'heading2', placeholder: 'Side-by-side comparison' },
        { type: 'list', placeholder: 'Before vs. after metrics' },
        { type: 'quote', placeholder: 'Team member on the transformation' },
        { type: 'heading2', placeholder: 'Lessons for others' },
        { type: 'paragraph', placeholder: 'Advice for similar organizations' }
      ],
      estimatedLength: '900-1100 words'
    },
    {
      id: 'case_study_multi_stakeholder',
      name: 'Multi-Stakeholder Perspective',
      description: 'Multiple viewpoints from different roles and departments',
      contentTypes: ['case_study'],
      contentPrompt: 'Present multiple perspectives from different stakeholders affected by this feature. Show how IT, business users, and end users each experienced benefits.',
      sections: [
        { type: 'paragraph', placeholder: 'Organization-wide challenge introduction' },
        { type: 'heading2', placeholder: 'The stakeholders' },
        { type: 'paragraph', placeholder: 'Who was involved and their roles' },
        { type: 'heading2', placeholder: 'IT perspective' },
        { type: 'paragraph', placeholder: 'Technical team\'s view and challenges' },
        { type: 'quote', placeholder: 'IT leader testimonial' },
        { type: 'heading2', placeholder: 'Business perspective' },
        { type: 'paragraph', placeholder: 'Business team\'s needs and concerns' },
        { type: 'quote', placeholder: 'Business leader testimonial' },
        { type: 'heading2', placeholder: 'End user perspective' },
        { type: 'paragraph', placeholder: 'How daily work was affected' },
        { type: 'quote', placeholder: 'End user testimonial' },
        { type: 'heading2', placeholder: 'Unified results' },
        { type: 'list', placeholder: 'Benefits realized across all groups' },
        { type: 'video', placeholder: 'Multi-stakeholder roundtable discussion (optional)' },
        { type: 'image', placeholder: 'Team celebration or group photo' },
        { type: 'heading2', placeholder: 'Keys to cross-functional success' },
        { type: 'paragraph', placeholder: 'What made collaboration work' }
      ],
      estimatedLength: '1300-1500 words'
    },
    
    // PRESS RELEASE LAYOUTS
    {
      id: 'press_release_announcement',
      name: 'Major Announcement',
      description: 'Formal press release structure for major company news',
      contentTypes: ['press_release'],
      contentPrompt: 'Present this feature as a major company announcement using formal press release language. Include executive quotes, market significance, and company positioning.',
      sections: [
        { type: 'paragraph', placeholder: 'Lead paragraph - who, what, when, where' },
        { type: 'quote', placeholder: 'CEO or executive statement' },
        { type: 'heading2', placeholder: 'Background and significance' },
        { type: 'paragraph', placeholder: 'Market context and importance' },
        { type: 'list', placeholder: 'Key benefits and features' },
        { type: 'heading2', placeholder: 'Industry impact' },
        { type: 'paragraph', placeholder: 'Market implications' },
        { type: 'quote', placeholder: 'Customer or partner endorsement' },
        { type: 'heading2', placeholder: 'About the company' },
        { type: 'paragraph', placeholder: 'Company boilerplate' }
      ],
      estimatedLength: '500-700 words'
    },
    {
      id: 'press_release_product',
      name: 'Product Launch',
      description: 'Product-focused press release with features and availability',
      contentTypes: ['press_release'],
      contentPrompt: 'Focus on the product launch details, key features, availability, and customer benefits. Include pricing and access information where relevant.',
      sections: [
        { type: 'paragraph', placeholder: 'Product launch announcement' },
        { type: 'heading2', placeholder: 'Product overview' },
        { type: 'paragraph', placeholder: 'Product description and value' },
        { type: 'video', placeholder: 'Product announcement video (optional)' },
        { type: 'list', placeholder: 'Key product features' },
        { type: 'quote', placeholder: 'Product leader statement' },
        { type: 'heading2', placeholder: 'Availability and pricing' },
        { type: 'paragraph', placeholder: 'Launch details and access' },
        { type: 'quote', placeholder: 'Early customer testimonial' },
        { type: 'paragraph', placeholder: 'Company information and contacts' }
      ],
      estimatedLength: '400-600 words'
    },
    {
      id: 'press_release_partnership',
      name: 'Partnership Announcement',
      description: 'Strategic partnership or collaboration announcement',
      contentTypes: ['press_release'],
      contentPrompt: 'Frame this feature as part of a strategic partnership or collaboration. Explain how partnerships enabled this innovation and mutual benefits.',
      sections: [
        { type: 'paragraph', placeholder: 'Partnership announcement with key details' },
        { type: 'quote', placeholder: 'CEO statement on partnership significance' },
        { type: 'heading2', placeholder: 'Partnership details' },
        { type: 'paragraph', placeholder: 'What the partnership entails' },
        { type: 'list', placeholder: 'Key benefits for customers' },
        { type: 'heading2', placeholder: 'Strategic value' },
        { type: 'paragraph', placeholder: 'Why this partnership matters' },
        { type: 'quote', placeholder: 'Partner company executive statement' },
        { type: 'heading2', placeholder: 'Customer impact' },
        { type: 'paragraph', placeholder: 'How customers will benefit' },
        { type: 'heading2', placeholder: 'About the partners' },
        { type: 'paragraph', placeholder: 'Both companies background' }
      ],
      estimatedLength: '500-700 words'
    },
    {
      id: 'press_release_milestone',
      name: 'Company Milestone',
      description: 'Achievement, funding, or growth milestone announcement',
      contentTypes: ['press_release'],
      contentPrompt: 'Present this feature as evidence of company growth and achievement. Focus on milestone metrics, market position, and future outlook.',
      sections: [
        { type: 'paragraph', placeholder: 'Milestone achievement announcement' },
        { type: 'heading2', placeholder: 'The achievement' },
        { type: 'paragraph', placeholder: 'Details of what was accomplished' },
        { type: 'list', placeholder: 'Key metrics and numbers' },
        { type: 'quote', placeholder: 'Leadership reflection on milestone' },
        { type: 'heading2', placeholder: 'Journey to this point' },
        { type: 'paragraph', placeholder: 'How the company got here' },
        { type: 'heading2', placeholder: 'What this means' },
        { type: 'paragraph', placeholder: 'Significance for industry/customers' },
        { type: 'quote', placeholder: 'Customer or investor testimonial' },
        { type: 'heading2', placeholder: 'Looking forward' },
        { type: 'paragraph', placeholder: 'What\'s next for the company' },
        { type: 'paragraph', placeholder: 'Company information and contacts' }
      ],
      estimatedLength: '600-800 words'
    },
    {
      id: 'press_release_executive',
      name: 'Executive Announcement',
      description: 'Leadership changes, new hires, or executive updates',
      contentTypes: ['press_release'],
      contentPrompt: 'Connect this feature to leadership vision and executive strategy. Show how this innovation reflects leadership priorities and company direction.',
      sections: [
        { type: 'paragraph', placeholder: 'Executive appointment/change announcement' },
        { type: 'heading2', placeholder: 'About the executive' },
        { type: 'paragraph', placeholder: 'Background and qualifications' },
        { type: 'quote', placeholder: 'Executive statement on joining/role' },
        { type: 'heading2', placeholder: 'Role and responsibilities' },
        { type: 'paragraph', placeholder: 'What they\'ll be leading' },
        { type: 'list', placeholder: 'Key focus areas and priorities' },
        { type: 'heading2', placeholder: 'Leadership perspective' },
        { type: 'quote', placeholder: 'CEO or board statement' },
        { type: 'heading2', placeholder: 'Company direction' },
        { type: 'paragraph', placeholder: 'How this supports company goals' },
        { type: 'paragraph', placeholder: 'Company information' }
      ],
      estimatedLength: '400-600 words'
    },
    {
      id: 'press_release_research',
      name: 'Research & Study Release',
      description: 'Industry research, survey results, or study findings',
      contentTypes: ['press_release'],
      contentPrompt: 'Present this feature as backed by research and data. Include study findings, market research, and evidence-based benefits.',
      sections: [
        { type: 'paragraph', placeholder: 'Research findings announcement' },
        { type: 'heading2', placeholder: 'Study overview' },
        { type: 'paragraph', placeholder: 'Research methodology and scope' },
        { type: 'heading2', placeholder: 'Key findings' },
        { type: 'list', placeholder: 'Most important research results' },
        { type: 'quote', placeholder: 'Research leader commentary' },
        { type: 'heading2', placeholder: 'Industry implications' },
        { type: 'paragraph', placeholder: 'What this means for the industry' },
        { type: 'heading2', placeholder: 'Detailed results' },
        { type: 'paragraph', placeholder: 'Additional data and insights' },
        { type: 'quote', placeholder: 'Industry expert or customer reaction' },
        { type: 'heading2', placeholder: 'Research availability' },
        { type: 'paragraph', placeholder: 'How to access full study' },
        { type: 'paragraph', placeholder: 'Company and research info' }
      ],
      estimatedLength: '700-900 words'
    },
    
    // NEWSLETTER LAYOUTS
    {
      id: 'newsletter_roundup',
      name: 'Monthly Roundup',
      description: 'Comprehensive update with multiple product and company news',
      contentTypes: ['newsletter'],
      contentPrompt: 'Present this feature as part of a broader product update. Use friendly, conversational tone and connect it to other company news and customer stories.',
      sections: [
        { type: 'paragraph', placeholder: 'Welcome message and month overview' },
        { type: 'heading2', placeholder: 'Product updates' },
        { type: 'list', placeholder: 'New features and improvements' },
        { type: 'image', placeholder: 'Feature highlight screenshot' },
        { type: 'heading2', placeholder: 'Customer spotlight' },
        { type: 'paragraph', placeholder: 'Customer success story' },
        { type: 'quote', placeholder: 'Customer testimonial' },
        { type: 'heading2', placeholder: 'Company news' },
        { type: 'paragraph', placeholder: 'Team updates and announcements' },
        { type: 'heading2', placeholder: 'What\'s coming next' },
        { type: 'paragraph', placeholder: 'Preview of upcoming features' }
      ],
      estimatedLength: '800-1000 words'
    },
    {
      id: 'newsletter_focused',
      name: 'Feature Focus',
      description: 'Single-feature deep dive with tutorials and tips',
      contentTypes: ['newsletter'],
      contentPrompt: 'Create an in-depth, tutorial-style explanation of this feature. Include step-by-step guidance, pro tips, and practical examples for users.',
      sections: [
        { type: 'paragraph', placeholder: 'Feature introduction and excitement' },
        { type: 'heading2', placeholder: 'Feature deep dive' },
        { type: 'paragraph', placeholder: 'Detailed feature explanation' },
        { type: 'image', placeholder: 'Feature demo or screenshot' },
        { type: 'video', placeholder: 'Tutorial walkthrough video (optional)' },
        { type: 'heading2', placeholder: 'How to get started' },
        { type: 'list', placeholder: 'Step-by-step tutorial' },
        { type: 'heading2', placeholder: 'Pro tips' },
        { type: 'list', placeholder: 'Advanced usage tips' },
        { type: 'quote', placeholder: 'Power user testimonial' },
        { type: 'paragraph', placeholder: 'Resources and next steps' }
      ],
      estimatedLength: '600-800 words'
    },
    {
      id: 'newsletter_community',
      name: 'Community Spotlight',
      description: 'User-generated content and community highlights',
      contentTypes: ['newsletter'],
      contentPrompt: 'Showcase how the community is using this feature creatively. Feature user stories, innovative use cases, and community feedback.',
      sections: [
        { type: 'paragraph', placeholder: 'Community celebration introduction' },
        { type: 'heading2', placeholder: 'Community highlights' },
        { type: 'paragraph', placeholder: 'Amazing things our users are doing' },
        { type: 'quote', placeholder: 'Featured community member spotlight' },
        { type: 'heading2', placeholder: 'User showcase' },
        { type: 'paragraph', placeholder: 'Creative use cases and implementations' },
        { type: 'image', placeholder: 'Community member work or photo' },
        { type: 'heading2', placeholder: 'Community feedback' },
        { type: 'list', placeholder: 'Most requested features or improvements' },
        { type: 'heading2', placeholder: 'Join the conversation' },
        { type: 'paragraph', placeholder: 'How to get involved in the community' },
        { type: 'heading2', placeholder: 'Community events' },
        { type: 'list', placeholder: 'Upcoming events and meetups' },
        { type: 'quote', placeholder: 'Community testimonial' },
        { type: 'paragraph', placeholder: 'Thank you and next steps' }
      ],
      estimatedLength: '700-900 words'
    },
    {
      id: 'newsletter_tips_tricks',
      name: 'Tips & Tricks Collection',
      description: 'Productivity tips, shortcuts, and power user techniques',
      contentTypes: ['newsletter'],
      contentPrompt: 'Break down this feature into actionable tips and productivity hacks. Show advanced techniques and share power user secrets.',
      sections: [
        { type: 'paragraph', placeholder: 'Tips collection introduction' },
        { type: 'heading2', placeholder: 'Tip #1: Quick wins' },
        { type: 'paragraph', placeholder: 'First productivity tip explanation' },
        { type: 'image', placeholder: 'Screenshot showing the tip' },
        { type: 'heading2', placeholder: 'Tip #2: Advanced techniques' },
        { type: 'paragraph', placeholder: 'More advanced tip or trick' },
        { type: 'code', placeholder: 'Example code or configuration' },
        { type: 'heading2', placeholder: 'Tip #3: Hidden gems' },
        { type: 'paragraph', placeholder: 'Lesser-known feature or shortcut' },
        { type: 'heading2', placeholder: 'Pro user spotlight' },
        { type: 'quote', placeholder: 'Power user sharing their favorite tip' },
        { type: 'heading2', placeholder: 'Reader submissions' },
        { type: 'list', placeholder: 'Tips shared by community members' },
        { type: 'heading2', placeholder: 'Try these out' },
        { type: 'paragraph', placeholder: 'Encouragement to experiment' }
      ],
      estimatedLength: '800-1000 words'
    },
    {
      id: 'newsletter_behind_product',
      name: 'Behind the Product',
      description: 'Development insights, team stories, and product journey',
      contentTypes: ['newsletter'],
      contentPrompt: 'Share the development story behind this feature. Include team insights, design decisions, challenges overcome, and what\'s coming next.',
      sections: [
        { type: 'paragraph', placeholder: 'Behind-the-scenes introduction' },
        { type: 'heading2', placeholder: 'This month in development' },
        { type: 'paragraph', placeholder: 'What the team has been working on' },
        { type: 'image', placeholder: 'Team photo or workspace shot' },
        { type: 'heading2', placeholder: 'Feature deep dive' },
        { type: 'paragraph', placeholder: 'Detailed look at a recent feature' },
        { type: 'quote', placeholder: 'Developer or designer perspective' },
        { type: 'heading2', placeholder: 'Design decisions' },
        { type: 'paragraph', placeholder: 'Why we built it this way' },
        { type: 'heading2', placeholder: 'Technical challenges' },
        { type: 'paragraph', placeholder: 'Interesting problems we solved' },
        { type: 'code', placeholder: 'Code snippet or technical example' },
        { type: 'heading2', placeholder: 'What\'s cooking' },
        { type: 'list', placeholder: 'Sneak peek at upcoming features' },
        { type: 'quote', placeholder: 'Team member excitement about what\'s next' },
        { type: 'paragraph', placeholder: 'Thanks and feedback request' }
      ],
      estimatedLength: '900-1100 words'
    },
    {
      id: 'newsletter_industry_trends',
      name: 'Industry Trends & Insights',
      description: 'Market analysis, trends, and thought leadership content',
      contentTypes: ['newsletter'],
      contentPrompt: 'Position this feature within broader industry trends. Analyze market implications, predict future developments, and provide strategic insights.',
      sections: [
        { type: 'paragraph', placeholder: 'Industry landscape introduction' },
        { type: 'heading2', placeholder: 'Trend spotlight' },
        { type: 'paragraph', placeholder: 'Key trend analysis and implications' },
        { type: 'image', placeholder: 'Trend visualization or chart' },
        { type: 'heading2', placeholder: 'Market insights' },
        { type: 'paragraph', placeholder: 'What we\'re seeing in the market' },
        { type: 'list', placeholder: 'Key market indicators or changes' },
        { type: 'heading2', placeholder: 'Our perspective' },
        { type: 'paragraph', placeholder: 'How this affects our users' },
        { type: 'quote', placeholder: 'Leadership insight on trends' },
        { type: 'heading2', placeholder: 'Preparing for change' },
        { type: 'paragraph', placeholder: 'How to stay ahead of trends' },
        { type: 'heading2', placeholder: 'Industry news' },
        { type: 'list', placeholder: 'Other notable industry developments' },
        { type: 'heading2', placeholder: 'Looking ahead' },
        { type: 'paragraph', placeholder: 'Predictions and expectations' }
      ],
      estimatedLength: '1000-1200 words'
    },

  ];

  const productFeatures: ProductFeature[] = [
    {
      id: '1',
      title: 'AI-Powered Data Export',
      description: 'Revolutionary data export feature that uses machine learning to automatically format and optimize data exports for different use cases',
      source: 'jira',
      status: 'released',
      release_date: '2024-01-15',
      jira_key: 'PROD-1234',
      category: 'Data Management',
      impact: 'high',
      customer_facing: true,
      technical_details: 'Built using TensorFlow and Python, integrated with our existing data pipeline through REST APIs',
      business_value: 'Reduces manual data export time by 80% and eliminates formatting errors',
      target_users: ['Data Analysts', 'Operations Teams', 'Business Intelligence Teams'],
      metrics: {
        usage_increase: '65%',
        time_savings: '80%',
        error_reduction: '95%',
        customer_satisfaction: '4.8/5'
      }
    },
    {
      id: '2',
      title: 'Real-time Dashboard Widgets',
      description: 'Customizable dashboard widgets that display live data with interactive charts and real-time updates',
      source: 'changelog',
      status: 'released',
      release_date: '2024-01-10',
      category: 'User Interface',
      impact: 'medium',
      customer_facing: true,
      technical_details: 'React-based widgets with WebSocket connections for real-time updates',
      business_value: 'Improves decision-making speed and data visibility',
      target_users: ['Executive Teams', 'Product Managers', 'Data Teams'],
      metrics: {
        usage_increase: '45%',
        time_savings: '30%',
        customer_satisfaction: '4.6/5'
      }
    },
    {
      id: '3',
      title: 'Advanced Security Framework',
      description: 'Enterprise-grade security framework with multi-factor authentication and advanced user permissions',
      source: 'jira',
      status: 'in_development',
      release_date: '2024-02-01',
      jira_key: 'SEC-5678',
      category: 'Security',
      impact: 'high',
      customer_facing: true,
      technical_details: 'OAuth 2.0, RBAC, and enterprise SSO integration',
      business_value: 'Meets enterprise security requirements and compliance standards',
      target_users: ['IT Administrators', 'Security Teams', 'Enterprise Customers']
    },
    {
      id: '4',
      title: 'Mobile App Integration',
      description: 'Native mobile app with offline capabilities and push notifications',
      source: 'changelog',
      status: 'planned',
      release_date: '2024-03-15',
      category: 'Mobile',
      impact: 'medium',
      customer_facing: true,
      technical_details: 'React Native with offline-first architecture',
      business_value: 'Extends platform accessibility and enables mobile workflows',
      target_users: ['Field Teams', 'Remote Workers', 'Mobile Users']
    }
  ];

  const filteredFeatures = productFeatures.filter(feature =>
    feature.title.toLowerCase().includes(featureSearch.toLowerCase()) ||
    feature.description.toLowerCase().includes(featureSearch.toLowerCase()) ||
    feature.category.toLowerCase().includes(featureSearch.toLowerCase()) ||
    (feature.jira_key && feature.jira_key.toLowerCase().includes(featureSearch.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getTemplateColor = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      teal: 'bg-teal-50 text-teal-600 border-teal-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      pink: 'bg-pink-50 text-pink-600 border-pink-200'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const generateSystematicContentForEdit = (layout: ContentLayout, featureId: string | null, contentType: string | null, title: string | null, description: string | null) => {
    // Find the feature data
    const feature = featureId ? productFeatures.find(f => f.id === featureId) : null;
    const template = contentTemplates.find(t => t.type === contentType);
    
    if (!feature || !template) {
      console.warn('Could not find feature or template for existing content');
      return;
    }

    // Generate content systematically based on layout structure
    const mockItem = {
      feature_title: feature?.title || title || 'Product Feature',
      feature_category: feature?.category || 'Technology'
    };

    // Define content patterns for each layout
    const layoutContentTemplates: { [key: string]: any[] } = {
      'blog_thought_leadership': [
        { type: 'paragraph', title: 'Hook', content: `The ${mockItem.feature_category.toLowerCase()} landscape is experiencing unprecedented transformation driven by AI, machine learning, and real-time processing capabilities.` },
        { type: 'heading2', title: 'Industry Challenge or Trend', content: 'Industry Challenge or Trend' },
        { type: 'paragraph', title: 'Market Analysis', content: `Organizations are struggling to keep pace with evolving ${mockItem.feature_category.toLowerCase()} requirements while maintaining operational efficiency and competitive advantage.` },
        { type: 'image', title: 'Industry Visualization', content: `Industry trends and market analysis for ${mockItem.feature_category}` },
        { type: 'video', title: 'Expert Discussion', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { type: 'heading2', title: 'Our Perspective', content: 'Our Perspective' },
        { type: 'paragraph', title: 'Expert Analysis', content: `Our ${mockItem.feature_title} represents a breakthrough approach to solving these industry challenges through innovative ${mockItem.feature_category.toLowerCase()} capabilities.` },
        { type: 'quote', title: 'Industry Expert Quote', content: `"This innovation in ${mockItem.feature_category.toLowerCase()} will fundamentally change how organizations approach their digital transformation strategies." - Industry Expert` },
        { type: 'heading2', title: 'Practical Implications', content: 'Practical Implications' },
        { type: 'list', title: 'Actionable Takeaways', content: `Implement ${mockItem.feature_category.toLowerCase()} best practices\\nLeverage ${mockItem.feature_title} for competitive advantage\\nDevelop strategic roadmap\\nMeasure and optimize results\\nStay ahead of industry trends` },
        { type: 'paragraph', title: 'Call to Action', content: `Ready to lead in ${mockItem.feature_category.toLowerCase()}? Start with ${mockItem.feature_title} and position your organization at the forefront of industry innovation.` }
      ],
      'blog_behind_scenes': [
        { type: 'paragraph', title: 'Feature Origin Story', content: `The idea for ${mockItem.feature_title} came from a simple observation: our users needed better ${mockItem.feature_category.toLowerCase()} capabilities.` },
        { type: 'heading2', title: 'The Spark of an Idea', content: 'The Spark of an Idea' },
        { type: 'paragraph', title: 'How the Idea Came About', content: `During a critical product meeting, user feedback revealed the urgent need for improved ${mockItem.feature_category.toLowerCase()} functionality that could scale with growing demands.` },
        { type: 'quote', title: 'Team Member Reflection', content: `"The biggest challenge wasn't technical - it was convincing everyone that we needed to rebuild our ${mockItem.feature_category.toLowerCase()} approach from the ground up." - Lead Developer` },
        { type: 'heading2', title: 'Design and Planning', content: 'Design and Planning' },
        { type: 'paragraph', title: 'Design Process', content: `Our design process involved extensive user research and architectural planning to ensure ${mockItem.feature_title} would scale effectively and meet diverse user needs.` },
        { type: 'image', title: 'Design Mockups', content: `Early wireframes and architectural diagrams for ${mockItem.feature_title}` },
        { type: 'video', title: 'Team Interviews', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { type: 'heading2', title: 'Development Challenges', content: 'Development Challenges' },
        { type: 'paragraph', title: 'Technical Obstacles', content: `The biggest technical obstacle was maintaining optimal performance while implementing advanced ${mockItem.feature_category.toLowerCase()} features that users demanded.` },
        { type: 'code', title: 'Technical Solution', content: `const ${mockItem.feature_title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()} = new FeatureEngine({\n  category: "${mockItem.feature_category}",\n  performance: "optimized",\n  scalability: true\n});` },
        { type: 'heading2', title: 'Testing and Refinement', content: 'Testing and Refinement' },
        { type: 'paragraph', title: 'User Testing Process', content: `We conducted extensive beta testing with over 500 users, iterating based on real usage patterns and feedback loops.` },
        { type: 'quote', title: 'Beta User Feedback', content: `"The new ${mockItem.feature_title} is incredible - everything works seamlessly and the interface feels intuitive." - Beta User` },
        { type: 'heading2', title: 'Lessons Learned', content: 'Lessons Learned' },
        { type: 'list', title: 'Key Insights', content: `User-centered design leads to better architecture\\nEarly feedback prevents costly redesigns\\nCross-team collaboration accelerates development\\nPerformance optimization requires ongoing attention\\nScalability must be built from day one` },
        { type: 'paragraph', title: 'What\'s Next', content: `Building ${mockItem.feature_title} taught us valuable lessons about ${mockItem.feature_category.toLowerCase()} development that will inform our next generation of features.` }
      ],
      'blog_comparison': [
        { type: 'paragraph', title: 'Market Landscape Overview', content: `Analysis of the current ${mockItem.feature_category.toLowerCase()} market and where our platform stands among industry leaders.` },
        { type: 'heading2', title: 'The Comparison Criteria', content: 'The Comparison Criteria' },
        { type: 'list', title: 'What We\'re Evaluating', content: `Performance and speed\\nUser experience and interface\\nScalability and reliability\\nIntegration capabilities\\nSecurity features\\nSupport and documentation` },
        { type: 'heading2', title: 'Our Solution', content: 'Our Solution' },
        { type: 'paragraph', title: 'Our Approach', content: `${mockItem.feature_title} represents our innovative approach to ${mockItem.feature_category.toLowerCase()} challenges with unique advantages.` },
        { type: 'image', title: 'Solution Interface', content: `${mockItem.feature_title} user interface and key features` },
        { type: 'video', title: 'Solution Demo', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { type: 'heading2', title: 'Alternative Approaches', content: 'Alternative Approaches' },
        { type: 'paragraph', title: 'How Others Solve This', content: `Traditional ${mockItem.feature_category.toLowerCase()} solutions often fall short in key areas like performance and user experience.` },
        { type: 'heading2', title: 'Head-to-Head Comparison', content: 'Head-to-Head Comparison' },
        { type: 'list', title: 'Feature Breakdown', content: `${mockItem.feature_title}: Advanced architecture\\nCompetitor A: Legacy system limitations\\n${mockItem.feature_title}: Real-time processing\\nCompetitor B: Batch processing only\\n${mockItem.feature_title}: Intuitive interface\\nIndustry Standard: Complex workflows` },
        { type: 'heading2', title: 'Why It Matters', content: 'Why It Matters' },
        { type: 'paragraph', title: 'Impact on Business', content: `The differences in ${mockItem.feature_category.toLowerCase()} capabilities translate directly to business outcomes and competitive advantage.` },
        { type: 'quote', title: 'Customer Perspective', content: `"Switching to this platform was the best decision we made - the difference in ${mockItem.feature_category.toLowerCase()} performance is remarkable." - Customer Success Manager` },
        { type: 'heading2', title: 'Making the Right Choice', content: 'Making the Right Choice' },
        { type: 'paragraph', title: 'Decision Guidance', content: `Organizations should prioritize solutions that offer both immediate benefits and long-term scalability in their ${mockItem.feature_category.toLowerCase()} strategy.` }
      ],
      'blog_howto_guide': [
        { type: 'paragraph', title: 'Introduction', content: `Learn how to implement ${mockItem.feature_title} to improve your ${mockItem.feature_category.toLowerCase()} workflow with this comprehensive guide.` },
        { type: 'video', title: 'Tutorial Overview', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { type: 'heading2', title: 'What You\'ll Need', content: 'What You\'ll Need' },
        { type: 'list', title: 'Prerequisites', content: `Basic understanding of ${mockItem.feature_category.toLowerCase()}\\nAccess to your account settings\\nAdmin permissions\\nStable internet connection\\nModern web browser` },
        { type: 'heading2', title: 'Step 1: Getting Started', content: 'Step 1: Getting Started' },
        { type: 'paragraph', title: 'First Step', content: `Begin by accessing the ${mockItem.feature_title} configuration panel in your dashboard settings.` },
        { type: 'image', title: 'Step 1 Screenshot', content: `${mockItem.feature_title} configuration panel interface` },
        { type: 'heading2', title: 'Step 2: Main Implementation', content: 'Step 2: Main Implementation' },
        { type: 'paragraph', title: 'Implementation Steps', content: `Configure the core ${mockItem.feature_title} settings to match your ${mockItem.feature_category.toLowerCase()} requirements.` },
        { type: 'code', title: 'Configuration Example', content: `{\n  "${mockItem.feature_title.toLowerCase().replace(/\\s+/g, '_')}": {\n    "enabled": true,\n    "category": "${mockItem.feature_category}",\n    "optimization": "high"\n  }\n}` },
        { type: 'heading2', title: 'Step 3: Testing and Verification', content: 'Step 3: Testing and Verification' },
        { type: 'paragraph', title: 'Verification Process', content: `Test your ${mockItem.feature_title} implementation to ensure everything works correctly.` },
        { type: 'image', title: 'Expected Results', content: `${mockItem.feature_title} successful implementation results` },
        { type: 'heading2', title: 'Troubleshooting Tips', content: 'Troubleshooting Tips' },
        { type: 'list', title: 'Common Issues', content: `Check network connectivity\\nVerify permissions are set correctly\\nClear browser cache and cookies\\nRestart the configuration process\\nContact support if issues persist` },
        { type: 'quote', title: 'Success Story', content: `"Following this guide made implementing ${mockItem.feature_title} incredibly straightforward. Our ${mockItem.feature_category.toLowerCase()} performance improved immediately!" - Implementation Specialist` }
      ],
      'case_study_transformation': [
        { type: 'paragraph', title: 'Challenge Overview', content: `Our client faced significant challenges with their existing ${mockItem.feature_category.toLowerCase()} infrastructure and needed a comprehensive solution.` },
        { type: 'video', title: 'Implementation Journey', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { type: 'paragraph', title: 'Solution Implementation', content: `We implemented ${mockItem.feature_title} as part of a comprehensive ${mockItem.feature_category.toLowerCase()} transformation strategy.` },
        { type: 'image', title: 'Before and After Comparison', content: `Visual comparison showing improvement after ${mockItem.feature_title} implementation` },
        { type: 'paragraph', title: 'Measurable Results', content: `The implementation delivered significant improvements in efficiency, performance, and user satisfaction.` },
        { type: 'quote', title: 'Client Testimonial', content: `The transformation exceeded our expectations - ${mockItem.feature_title} has revolutionized our ${mockItem.feature_category.toLowerCase()} operations.` },
        { type: 'paragraph', title: 'Key Success Factors', content: `Success was driven by thorough planning, stakeholder engagement, and phased implementation of ${mockItem.feature_title}.` }
      ],
      'case_study_roi_focused': [
        { type: 'paragraph', title: 'Executive Summary', content: `Comprehensive analysis showing significant ROI achieved through ${mockItem.feature_title} implementation.` },
        { type: 'video', title: 'Financial Impact Visualization', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { type: 'paragraph', title: 'Investment Overview', content: `The client invested in ${mockItem.feature_title} to modernize their ${mockItem.feature_category.toLowerCase()} capabilities.` },
        { type: 'paragraph', title: 'Key Performance Metrics', content: `40% reduction in processing time, 60% improvement in accuracy, and 240% ROI within 18 months.` },
        { type: 'image', title: 'ROI Timeline Chart', content: `Month-by-month ROI progression after ${mockItem.feature_title} implementation` },
        { type: 'paragraph', title: 'Cost Savings Analysis', content: `Direct cost savings from improved ${mockItem.feature_category.toLowerCase()} efficiency and reduced manual processes.` },
        { type: 'quote', title: 'Financial Officer Quote', content: `The ROI from ${mockItem.feature_title} exceeded our projections - it's been one of our most successful technology investments.` },
        { type: 'paragraph', title: 'Implementation Timeline', content: `Month-by-month breakdown of implementation milestones and corresponding business impact.` }
      ],
      'press_release_announcement': [
        { type: 'paragraph', title: 'Lead Paragraph', content: `Today we announce the launch of ${mockItem.feature_title}, setting new industry standards for ${mockItem.feature_category.toLowerCase()} solutions. This breakthrough technology addresses critical market needs and positions our company as a leader in innovative ${mockItem.feature_category.toLowerCase()}.` },
        { type: 'quote', title: 'CEO Statement', content: `"${mockItem.feature_title} represents our commitment to innovation in ${mockItem.feature_category.toLowerCase()} and will help organizations achieve new levels of efficiency. This launch marks a significant milestone in our company's growth." - CEO` },
        { type: 'heading2', title: 'Background and Significance', content: 'Background and Significance' },
        { type: 'paragraph', title: 'Market Context', content: `The ${mockItem.feature_category.toLowerCase()} market has been seeking advanced solutions that can deliver both performance and reliability. ${mockItem.feature_title} addresses these challenges through innovative technology and user-centered design.` },
        { type: 'list', title: 'Key Benefits and Features', content: `Advanced ${mockItem.feature_category.toLowerCase()} capabilities\nSeamless integration with existing systems\nImproved performance and reliability\nEnterprise-grade security\nScalable architecture` },
        { type: 'heading2', title: 'Industry Impact', content: 'Industry Impact' },
        { type: 'paragraph', title: 'Market Implications', content: `This launch is expected to accelerate adoption of ${mockItem.feature_category.toLowerCase()} solutions across enterprise markets. Industry analysts predict significant market growth driven by innovations like ${mockItem.feature_title}.` },
        { type: 'quote', title: 'Customer Endorsement', content: `"We've been beta testing ${mockItem.feature_title} and the results have exceeded our expectations. This technology has transformed our ${mockItem.feature_category.toLowerCase()} operations." - Enterprise Customer` },
        { type: 'heading2', title: 'About the Company', content: 'About the Company' },
        { type: 'paragraph', title: 'Company Boilerplate', content: `Our company is a leading provider of ${mockItem.feature_category.toLowerCase()} solutions, serving enterprise customers worldwide. We are committed to innovation and helping organizations achieve their digital transformation goals through cutting-edge technology.` }
      ],
      'newsletter_focused': [
        { type: 'paragraph', title: 'Feature Introduction', content: `This month we spotlight ${mockItem.feature_title}, our breakthrough innovation in ${mockItem.feature_category.toLowerCase()} that's transforming how teams work.` },
        { type: 'heading2', title: 'Feature Deep Dive', content: 'Feature Deep Dive' },
        { type: 'paragraph', title: 'Detailed Feature Explanation', content: `${mockItem.feature_title} leverages advanced technology to deliver superior ${mockItem.feature_category.toLowerCase()} capabilities, providing unprecedented performance and user experience.` },
        { type: 'image', title: 'Feature Demo Screenshot', content: `${mockItem.feature_title} interface and key features demonstration` },
        { type: 'video', title: 'Tutorial Walkthrough', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { type: 'heading2', title: 'How to Get Started', content: 'How to Get Started' },
        { type: 'list', title: 'Step-by-Step Tutorial', content: `Enable ${mockItem.feature_title} in your settings\\nConnect your data sources\\nConfigure your preferences\\nStart analyzing results\\nShare insights with your team` },
        { type: 'heading2', title: 'Pro Tips', content: 'Pro Tips' },
        { type: 'list', title: 'Advanced Usage Tips', content: `Use keyboard shortcuts for faster navigation\\nSet up automated workflows\\nCustomize dashboards for your role\\nIntegrate with existing tools\\nSchedule regular reports` },
        { type: 'quote', title: 'Power User Testimonial', content: `"${mockItem.feature_title} has completely transformed our ${mockItem.feature_category.toLowerCase()} workflow. We're seeing 300% better results and our team productivity has skyrocketed." - Senior ${mockItem.feature_category} Manager` },
        { type: 'paragraph', title: 'Resources and Next Steps', content: `Ready to get started with ${mockItem.feature_title}? Check out our comprehensive documentation, join our community forum, and don't forget to follow us for the latest updates and feature announcements.` }
      ]
    };

    // Get the template for this layout or use layout sections as fallback
    const contentTemplate = layoutContentTemplates[layout.id];
    
    const sections: ContentSection[] = layout.sections.map((section, index) => {
      const sectionId = (index + 1).toString();
      let content = '';

      if (contentTemplate && contentTemplate[index]) {
        content = contentTemplate[index].content;
      } else {
        // Fallback content generation
        switch (section.type) {
          case 'paragraph':
            content = `Generated content for ${mockItem.feature_title} related to ${section.placeholder}.`;
            break;
          case 'video':
            content = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
            break;
          case 'quote':
            content = `"${mockItem.feature_title} has significantly improved our ${mockItem.feature_category.toLowerCase()} operations."`;
            break;
          case 'code':
            content = `// Example code for ${mockItem.feature_title}\nconst feature = new ${mockItem.feature_title.replace(/[^a-zA-Z0-9]/g, '')}();`;
            break;
          case 'image':
            content = `${section.placeholder} for ${mockItem.feature_title}`;
            break;
          case 'list':
            content = `Key feature benefits\nImproved performance\nBetter user experience\nAdvanced capabilities\nSeamless integration`;
            break;
          case 'heading2':
            content = section.placeholder;
            break;
          default:
            content = `Content about ${mockItem.feature_title} in ${mockItem.feature_category}.`;
        }
      }

      return {
        id: sectionId,
        type: section.type,
        content: content,
        metadata: section.type === 'quote' ? { author: 'Customer Success Story' } : {}
      };
    });

    // Set the rich content
    const richContent: RichContent = {
      title: title || feature.title,
      subtitle: description || feature.description,
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
      sections: sections,
      metadata: {
        author: 'Content Team',
        readTime: 8,
        tags: [feature.category, 'Product Update', template.type.replace('_', ' ')],
        category: feature.category
      }
    };

    setRichContent(richContent);
  };

  const generateRichContent = async (feature: ProductFeature, template: ContentTemplate, layout: ContentLayout) => {
    setIsGeneratingAI(true);
    
    try {
      // Simulate AI generation - replace with actual AI API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate content based on selected layout, using the layout's content prompt and feature data
      const generateContentForSection = (sectionType: string, index: number) => {
        const sectionId = (index + 1).toString();
        const contentType = template.type;
        const layoutPrompt = layout.contentPrompt;
        
        // Use actual feature data throughout
        const featureData = {
          title: feature.title,
          description: feature.description,
          category: feature.category,
          impact: feature.impact,
          status: feature.status,
          technical_details: feature.technical_details,
          business_value: feature.business_value,
          target_users: feature.target_users,
          metrics: feature.metrics,
          jira_key: feature.jira_key,
          release_date: feature.release_date
        };
        
        // Content type specific tone and language
        const getToneBasedContent = (baseContent: string[]) => {
          if (contentType === 'press_release') {
            return baseContent.map(content => content.replace(/We're thrilled/g, 'The company is pleased').replace(/exciting/g, 'significant'));
          }
          if (contentType === 'newsletter') {
            return baseContent.map(content => content.replace(/announce/g, 'share').replace(/We're thrilled/g, 'We\'re excited'));
          }
          if (contentType === 'case_study') {
            return baseContent.map(content => content.replace(/We're thrilled/g, 'Our customer experienced').replace(/our/g, 'their'));
          }
          return baseContent; // blog posts keep original tone
        };
        
        switch (sectionType) {
          case 'heading1':
            const h1Options = contentType === 'press_release' 
              ? [`${feature.title} Officially Launched by Company`]
              : [`${feature.title}: ${feature.business_value}`];
            return {
              id: sectionId,
              type: 'heading1' as const,
              content: h1Options[0]
            };
            
          case 'heading2':
            const headingsByType = {
              'blog': ['The Challenge', 'Our Solution', 'Key Features', 'Early Results', 'What\'s Next'],
              'case_study': ['Customer Background', 'The Challenge', 'The Solution', 'Results Achieved', 'Looking Forward'],
              'press_release': ['Background and Significance', 'Industry Impact', 'About the Company', 'Availability'],
              'newsletter': ['Product Updates', 'Customer Spotlight', 'Company News', 'What\'s Coming Next']
            };
            const headingOptions = headingsByType[contentType as keyof typeof headingsByType] || headingsByType.blog;
            return {
              id: sectionId,
              type: 'heading2' as const,
              content: headingOptions[index % headingOptions.length]
            };
            
          case 'heading3':
            const subheadingOptions = ['Overview', 'Details', 'Impact', 'Next Steps', 'Key Benefits', 'Technical Specs'];
            return {
              id: sectionId,
              type: 'heading3' as const,
              content: subheadingOptions[index % subheadingOptions.length]
            };
            
          case 'paragraph':
            // Generate content based on feature data and layout prompt context
            const generateFeatureBasedParagraph = () => {
              const baseContent = [
                // Introduction/Announcement style
                `We're thrilled to introduce ${featureData.title}, a ${featureData.impact}-impact ${featureData.category.toLowerCase()} feature that ${featureData.description}. This ${featureData.status === 'released' ? 'newly available' : 'upcoming'} capability represents a significant advancement in how ${featureData.target_users.join(' and ')} can ${featureData.business_value.toLowerCase()}.`,
                
                // Problem/Challenge context
                `In today's rapidly evolving landscape, ${featureData.target_users.join(', ')} face increasing demands for efficiency and innovation in ${featureData.category.toLowerCase()}. Traditional approaches often fall short of meeting these complex requirements, creating bottlenecks that hinder productivity and growth.`,
                
                // Solution description
                `${featureData.title} addresses these challenges through ${featureData.technical_details}. The result is a comprehensive solution that ${featureData.business_value.toLowerCase()}, delivering measurable value to organizations of all sizes.`,
                
                // Results and metrics
                `${featureData.metrics ? 
                  `Early results have been remarkable. Organizations implementing this feature report ${featureData.metrics.time_savings || '40% time savings'}, ${featureData.metrics.usage_increase || '60% productivity improvements'}, and ${featureData.metrics.customer_satisfaction || '95% user satisfaction'}.` :
                  `Early feedback has been overwhelmingly positive, with users noting significant improvements in efficiency, reduced complexity, and enhanced workflow capabilities.`
                }`,
                
                // Technical details and implementation
                `Built with ${featureData.technical_details}, this feature integrates seamlessly with existing workflows while providing the advanced capabilities that ${featureData.category.toLowerCase()} professionals demand. The implementation focuses on both performance and user experience.`,
                
                // Future outlook
                `This release marks an important milestone in our commitment to innovation in ${featureData.category.toLowerCase()}. We're already working on the next phase of enhancements, including advanced analytics, expanded integrations, and additional customization options.`,
                
                // User benefit focus
                `For ${featureData.target_users.join(' and ')}, ${featureData.title} transforms daily workflows by ${featureData.business_value.toLowerCase()}. The intuitive interface and powerful capabilities ensure that teams can focus on their core objectives rather than technical complexities.`
              ];
              
              return baseContent[index % baseContent.length];
            };
            
            const content = generateFeatureBasedParagraph();
            const tonedContent = getToneBasedContent([content])[0];
            
            return {
              id: sectionId,
              type: 'paragraph' as const,
              content: tonedContent
            };
            
          case 'image':
            const imageOptions = [
              { src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop', alt: 'Team collaboration and productivity' },
              { src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop', alt: 'Product interface showcase' },
              { src: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=400&fit=crop', alt: 'Customer success and results' },
              { src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop', alt: 'Technical implementation' }
            ];
            return {
              id: sectionId,
              type: 'image' as const,
              content: '',
              metadata: imageOptions[index % imageOptions.length]
            };
            
          case 'video':
            const videoOptions = [
              { src: 'https://www.youtube.com/embed/dQw4w9WgXcQ', description: `Product demo showcasing ${featureData.title}` },
              { src: 'https://www.youtube.com/embed/ScMzIvxBSi4', description: `Tutorial: Getting started with ${featureData.title}` },
              { src: 'https://www.youtube.com/embed/kJQP7kiw5Fk', description: `Customer success story featuring ${featureData.title}` },
              { src: 'https://www.youtube.com/embed/jNQXAC9IVRw', description: `Behind the scenes: Building ${featureData.title}` }
            ];
            const selectedVideo = videoOptions[index % videoOptions.length];
            return {
              id: sectionId,
              type: 'video' as const,
              content: selectedVideo.description,
              metadata: { src: selectedVideo.src }
            };
            
          case 'list':
            const listsByType = {
              'blog': ['Key Features', 'Benefits', 'Use Cases'],
              'case_study': ['Pain Points', 'Solution Components', 'Results Achieved'],
              'press_release': ['Key Benefits and Features', 'Competitive Advantages'],
              'newsletter': ['New Features', 'Pro Tips', 'What\'s Coming Next']
            };
            const listTitle = (listsByType[contentType as keyof typeof listsByType] || listsByType.blog)[index % 3];
            
            // Generate feature-specific list items
            const generateFeatureBasedList = () => {
              const baseItems = [
                `Advanced ${featureData.category} capabilities for ${featureData.target_users.join(' and ')}`,
                `${featureData.technical_details}`,
                `${featureData.business_value}`,
                `Designed for ${featureData.impact}-impact organizational improvements`
              ];
              
              // Add metrics if available
              if (featureData.metrics) {
                if (featureData.metrics.time_savings) baseItems.push(`${featureData.metrics.time_savings} time savings`);
                if (featureData.metrics.usage_increase) baseItems.push(`${featureData.metrics.usage_increase} productivity improvement`);
                if (featureData.metrics.error_reduction) baseItems.push(`${featureData.metrics.error_reduction} error reduction`);
                if (featureData.metrics.customer_satisfaction) baseItems.push(`${featureData.metrics.customer_satisfaction} user satisfaction`);
              }
              
              // Add release/status info if relevant
              if (featureData.release_date) {
                baseItems.push(`${featureData.status === 'released' ? 'Released' : 'Planned for'} ${featureData.release_date}`);
              }
              
              return baseItems.slice(0, 4); // Keep to 4 items for readability
            };
            
            return {
              id: sectionId,
              type: 'list' as const,
              content: listTitle,
              metadata: {
                items: generateFeatureBasedList()
              }
            };
            
          case 'quote':
            // Generate feature-specific quotes based on content type and feature data
            const generateFeatureBasedQuote = () => {
              const quotes = {
                'blog': [
                  { content: `"${featureData.title} has completely transformed how our team approaches ${featureData.category.toLowerCase()}. The efficiency gains are remarkable and the user experience is seamless."`, author: 'Sarah Johnson, Product Manager at TechCorp' },
                  { content: `"What impressed us most about ${featureData.title} is how it ${featureData.business_value.toLowerCase()}. It's exactly what ${featureData.target_users.join(' and ')} have been waiting for."`, author: 'David Kim, Operations Director' }
                ],
                'case_study': [
                  { content: `"The implementation of ${featureData.title} exceeded our expectations. We saw immediate improvements in ${featureData.category.toLowerCase()} and overall team satisfaction."`, author: 'Michael Chen, CTO at Enterprise Solutions' },
                  { content: `"${featureData.title} solved our biggest challenge in ${featureData.category.toLowerCase()}. The ${featureData.metrics?.time_savings || 'efficiency improvements'} speak for themselves."`, author: 'Lisa Rodriguez, VP of Operations' }
                ],
                'press_release': [
                  { content: `"${featureData.title} represents a significant advancement in ${featureData.category.toLowerCase()} technology. We're proud to bring this ${featureData.impact}-impact innovation to market."`, author: 'CEO, Company Name' },
                  { content: `"This release demonstrates our commitment to helping ${featureData.target_users.join(' and ')} achieve more through technology innovation."`, author: 'Chief Product Officer, Company Name' }
                ],
                'newsletter': [
                  { content: `"I love the new ${featureData.title} feature! It's exactly what I needed to ${featureData.business_value.toLowerCase()}. Game changer!"`, author: 'Alex Rodriguez, Power User' },
                  { content: `"${featureData.title} makes ${featureData.category.toLowerCase()} so much easier. The team really listened to our feedback!"`, author: 'Sam Chen, Beta User' }
                ]
              };
              
              const typeQuotes = quotes[contentType as keyof typeof quotes] || quotes.blog;
              return typeQuotes[index % typeQuotes.length];
            };
            
            const quoteData = generateFeatureBasedQuote();
            return {
              id: sectionId,
              type: 'quote' as const,
              content: quoteData.content,
              metadata: { author: quoteData.author }
            };
            
          case 'code':
            // Generate feature-specific code examples
            const generateFeatureCode = () => {
              const featureName = featureData.title.toLowerCase().replace(/[^a-z0-9]/g, '');
              const category = featureData.category.toLowerCase().replace(/[^a-z0-9]/g, '');
              
              return `// ${featureData.title} Configuration\nconst ${featureName}Config = {\n  enabled: true,\n  mode: '${featureData.status === 'released' ? 'production' : 'beta'}',\n  category: '${category}',\n  targetUsers: [${featureData.target_users.map(user => `'${user.toLowerCase()}'`).join(', ')}],\n  features: {\n    ${featureData.impact}Impact: true,\n    ${category}Optimization: true,\n    analytics: true\n  }\n};\n\n// Initialize ${featureData.title}\nconst ${featureName} = new ${category.charAt(0).toUpperCase() + category.slice(1)}Feature(${featureName}Config);`;
            };
            
            return {
              id: sectionId,
              type: 'code' as const,
              content: generateFeatureCode(),
              metadata: { language: 'javascript' }
            };
            
          case 'divider':
            return {
              id: sectionId,
              type: 'divider' as const,
              content: ''
            };
            
          default:
            return {
              id: sectionId,
              type: 'paragraph' as const,
              content: `Content for ${sectionType} section about ${feature.title}.`
            };
        }
      };

      // Generate layout-specific title and subtitle
      const generateLayoutSpecificTitle = () => {
        const layoutId = layout.id;
        
        if (layoutId.includes('thought_leadership')) {
          return `The Future of ${feature.category}: How ${feature.title} is Changing the Game`;
        } else if (layoutId.includes('howto')) {
          return `How to Get Started with ${feature.title}: A Complete Guide`;
        } else if (layoutId.includes('comparison')) {
          return `${feature.title} vs. Traditional ${feature.category}: A Comprehensive Analysis`;
        } else if (layoutId.includes('behind_scenes')) {
          return `Building ${feature.title}: The Story Behind Our Latest ${feature.category} Innovation`;
        } else if (layoutId.includes('technical')) {
          return `Technical Deep Dive: Implementing ${feature.title}`;
        } else if (layoutId.includes('roi')) {
          return `${feature.title} ROI Analysis: Measuring Success in ${feature.category}`;
        } else if (layoutId.includes('before_after')) {
          return `Transformation Story: Before and After ${feature.title}`;
        } else if (layoutId.includes('multi_stakeholder')) {
          return `${feature.title}: A Multi-Department Success Story`;
        } else if (layoutId.includes('press_release')) {
          return `${feature.title} Officially ${feature.status === 'released' ? 'Released' : 'Announced'}`;
        } else if (layoutId.includes('newsletter')) {
          return `Newsletter: Exciting Updates About ${feature.title}`;
        }
        
        // Default fallback
        return `Introducing ${feature.title}: ${feature.business_value}`;
      };
      
      const generateLayoutSpecificSubtitle = () => {
        const layoutId = layout.id;
        
        if (layoutId.includes('thought_leadership')) {
          return `Industry analysis and expert insights on the evolution of ${feature.category.toLowerCase()}`;
        } else if (layoutId.includes('howto')) {
          return `Step-by-step guidance for implementing and mastering this ${feature.impact}-impact feature`;
        } else if (layoutId.includes('comparison')) {
          return `Understanding the advantages and unique value proposition of our approach`;
        } else if (layoutId.includes('behind_scenes')) {
          return `Development insights, challenges overcome, and lessons learned from our team`;
        } else if (layoutId.includes('roi')) {
          return `Quantified business impact and financial benefits for ${feature.target_users.join(' and ')}`;
        } else if (layoutId.includes('press_release')) {
          return `${feature.impact.charAt(0).toUpperCase() + feature.impact.slice(1)}-impact ${feature.category.toLowerCase()} solution now available`;
        }
        
        // Default fallback
        return `How ${feature.title} is revolutionizing ${feature.category.toLowerCase()} for ${feature.target_users.join(', ')}`;
      };

      const richContent: RichContent = {
        title: generateLayoutSpecificTitle(),
        subtitle: generateLayoutSpecificSubtitle(),
        coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
        sections: layout.sections.map((section, index) => generateContentForSection(section.type, index)),
        metadata: {
          author: 'Content AI',
          readTime: 8,
          tags: [feature.category, feature.title, ...feature.target_users],
          category: 'Product Updates'
        }
      };
      
      setRichContent(richContent);
      setContentGenerated(true);
    } catch (error) {
      console.error('Error generating rich content:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleRegenerateContent = async () => {
    if (selectedTemplate && selectedFeature && selectedLayout) {
      setShowRegenerateNotification(false);
      console.log('🔄 REGENERATE: Notification hidden');
      
      // Clear old HTML exports before regenerating
      if (editingId) {
        localStorage.removeItem(`preview_html_${editingId}_latest`);
        localStorage.removeItem(`preview_html_${editingId}`);
        console.log('🔄 REGENERATE: Cleared unified and legacy HTML exports');
      }
      
      await generateRichContent(selectedFeature, selectedTemplate, selectedLayout);
      
      // Ensure notification stays hidden after regeneration completes
      setShowRegenerateNotification(false);
      console.log('✅ REGENERATE: Complete - notification hidden');
    }
  };

  // Generate final HTML for preview
  const generatePreviewHTML = (content: RichContent): string => {
    console.log('🔧 HTML GEN DEBUG: Generating HTML for', content.sections.length, 'sections');
    console.log('🔧 HTML GEN DEBUG: First section:', content.sections[0]);
    console.log('🔧 HTML GEN DEBUG: Section types:', content.sections.map(s => s.type));
    
    const sectionsHTML = content.sections.map(section => {
      switch (section.type) {
        case 'heading1':
          return `<h1 class="text-3xl font-bold text-gray-900 mb-6">${section.content}</h1>`;
        case 'heading2':
          return `<h2 class="text-2xl font-semibold text-gray-800 mb-4 mt-8">${section.content}</h2>`;
        case 'heading3':
          return `<h3 class="text-xl font-medium text-gray-700 mb-3 mt-6">${section.content}</h3>`;
        case 'paragraph':
          return `<p class="text-gray-600 leading-relaxed mb-4">${section.content}</p>`;
        case 'image':
          const imgSrc = section.metadata?.src || '';
          const imgAlt = section.metadata?.alt || section.content || 'Image';
          return `<div class="my-6">
                    <img src="${imgSrc}" alt="${imgAlt}" class="w-full rounded-lg shadow-sm" />
                    ${section.content ? `<p class="text-sm text-gray-500 mt-2 text-center">${section.content}</p>` : ''}
                  </div>`;
        case 'video':
          const videoSrc = section.metadata?.src || '';
          return `<div class="my-6">
                    <div class="aspect-video">
                      <iframe src="${videoSrc}" class="w-full h-full rounded-lg" frameborder="0" allowfullscreen></iframe>
                    </div>
                    ${section.content ? `<p class="text-sm text-gray-500 mt-2 text-center">${section.content}</p>` : ''}
                  </div>`;
        case 'list':
          const listItems = section.content.split('\n').filter(item => item.trim());
          return `<ul class="list-disc list-inside text-gray-600 mb-4 space-y-2">
                    ${listItems.map(item => `<li>${item.trim()}</li>`).join('')}
                  </ul>`;
        case 'quote':
          const author = section.metadata?.author || '';
          return `<blockquote class="border-l-4 border-blue-500 pl-4 my-6 italic text-gray-700">
                    "${section.content}"
                    ${author ? `<cite class="block text-sm text-gray-500 mt-2">— ${author}</cite>` : ''}
                  </blockquote>`;
        case 'code':
          const language = section.metadata?.language || 'javascript';
          return `<pre class="bg-gray-100 rounded-lg p-4 overflow-x-auto my-4">
                    <code class="text-sm text-gray-800">${section.content}</code>
                  </pre>`;
        case 'divider':
          return `<hr class="border-gray-300 my-8">`;
        default:
          return `<div class="text-gray-600 mb-4">${section.content}</div>`;
      }
    }).join('\n');

    return `
      <article class="max-w-4xl mx-auto px-6 py-8">
        <header class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">${content.title}</h1>
          ${content.subtitle ? `<p class="text-xl text-gray-600 mb-6">${content.subtitle}</p>` : ''}
          ${content.coverImage ? `<img src="${content.coverImage}" alt="${content.title}" class="w-full h-64 object-cover rounded-lg mb-6" />` : ''}
          <div class="flex items-center text-sm text-gray-500 space-x-4">
            <span>By ${content.metadata.author}</span>
            <span>•</span>
            <span>${content.metadata.readTime} min read</span>
            <span>•</span>
            <span>${content.metadata.tags.join(', ')}</span>
          </div>
        </header>
        <div class="prose prose-lg max-w-none">
          ${sectionsHTML}
        </div>
      </article>
    `;
  };

  // Export content for preview
  const exportForPreview = () => {
    if (richContent && editingId) {
      console.log('🔧 DEBUG: Exporting richContent with title:', richContent.title);
      console.log('🔧 DEBUG: richContent sections count:', richContent.sections.length);
      const previewHTML = generatePreviewHTML(richContent);
      
      // Save to both unified and legacy keys
      const unifiedHTMLKey = `preview_html_${editingId}_latest`;
      const legacyHTMLKey = `preview_html_${editingId}`;
      
      localStorage.setItem(unifiedHTMLKey, previewHTML);
      localStorage.setItem(legacyHTMLKey, previewHTML);
      
      console.log('✅ UNIFIED HTML EXPORT: Saved to both keys');
      console.log('- Unified key:', unifiedHTMLKey);
      console.log('- Legacy key:', legacyHTMLKey);
      console.log('HTML preview:', previewHTML.substring(0, 200) + '...');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20">
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/content-pipeline')}
                className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Edit Content' : 'Create Content'}
                </h1>
                <p className="text-gray-800">
                  {editingId ? 'Update your content details' : 'Create professional external communications with AI-powered rich content'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {editingId ? (
                <>
                  {/* Publish Status Indicator */}
                  <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                    publishStatus === 'published' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      publishStatus === 'published' ? 'bg-green-600' : 'bg-amber-600'
                    }`} />
                    <span>{publishStatus === 'published' ? 'Published' : 'Draft'}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    {/* Save as Draft / Unpublish Button */}
                    {publishStatus === 'published' ? (
                      <button
                        onClick={() => {
                          // Unpublish: change status back to draft, stay on edit page
                          console.log('📝 UNPUBLISH: Changing status back to draft');
                          setPublishStatus('draft');
                        }}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      >
                        <X className="w-4 h-4" />
                        <span>Unpublish</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          // Save as draft (status remains 'draft') and return to pipeline
                          console.log('💾 SAVE AS DRAFT: Saving and returning to pipeline');
                          setPublishStatus('draft'); // Ensure status stays draft
                          router.push('/content-pipeline');
                        }}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save as Draft</span>
                      </button>
                    )}

                    {/* Publish Button */}
                    {publishStatus === 'draft' && (
                      <button
                        onClick={() => {
                          // Publish and return to pipeline
                          console.log('🚀 PUBLISH: Publishing and returning to pipeline');
                          setPublishStatus('published');
                          router.push('/content-pipeline');
                        }}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Publish</span>
                      </button>
                    )}

                    {/* Preview Button */}
                    <button
                      onClick={() => {
                        console.log('🚀 PREVIEW BUTTON: Force exporting latest content...');
                        exportForPreview();
                        // Small delay to ensure export completes before opening preview
                        setTimeout(() => {
                          const previewUrl = `/content/next-generation-security-framework-launch`;
                          window.open(previewUrl, '_blank');
                        }, 100);
                      }}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>
                  </div>
                </>
              ) : (
                // Create mode - show preview button when content is generated
                contentGenerated && (
                  <button
                    onClick={() => {
                      console.log('🚀 PREVIEW BUTTON: Force exporting latest content...');
                      exportForPreview();
                      setTimeout(() => {
                        const previewUrl = `/content/next-generation-security-framework-launch`;
                        window.open(previewUrl, '_blank');
                      }, 100);
                    }}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                )
              )}
            </div>
          </div>


          {/* Content Setup - Full Width Layout */}
          <div className="space-y-4">
            {/* Step 1: Content Type Selection */}
            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-4">
              <div className="flex items-center justify-between cursor-pointer" 
                   onClick={() => setStepsCollapsed(prev => ({...prev, step1: !prev.step1}))}>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-semibold text-gray-900">Step 1: Select Content Type</h2>
                    {selectedTemplate && stepsCollapsed.step1 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {selectedTemplate.name}
                      </span>
                    )}
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  {stepsCollapsed.step1 ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
              
              {!stepsCollapsed.step1 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-800 mb-3">Choose the type of external communication you want to create</p>
                </div>
              )}
              
              {!stepsCollapsed.step1 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                {contentTemplates.map((template) => {
                  const Icon = template.icon;
                  const isSelected = selectedTemplate?.id === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => updateSelectedTemplate(template)}
                      className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : `border-gray-200 hover:border-gray-300 ${getTemplateColor(template.color)}`
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-2">
                          <Icon className={`w-8 h-8 ${isSelected ? 'text-blue-600' : ''}`} />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm">{template.name}</h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{template.description}</p>
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-900">
                          <Clock className="w-3 h-3 mr-1" />
                          {template.estimatedTime}
                        </div>
                      </div>
                    </button>
                  );
                })}
                </div>
              )}
            </div>

            {/* Step 2: Feature Selection */}
            {selectedTemplate && (
              <div ref={step2Ref} className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-4">
                <div className="flex items-center justify-between cursor-pointer" 
                     onClick={() => setStepsCollapsed(prev => ({...prev, step2: !prev.step2}))}>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-semibold text-gray-900">Step 2: Select Product Feature</h2>
                      {selectedFeature && stepsCollapsed.step2 && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          {selectedFeature.title}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    {stepsCollapsed.step2 ? (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
                
                {!stepsCollapsed.step2 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-800 mb-3">Choose the feature or release you want to create content about</p>
                  </div>
                )}
                
                {!stepsCollapsed.step2 && (
                  <>
                    {/* Search */}
                    <div className="relative mb-3">
                  <input
                    type="text"
                    value={featureSearch}
                    onChange={(e) => setFeatureSearch(e.target.value)}
                    placeholder="Search for a feature, JIRA ticket, or changelog entry..."
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 text-gray-900"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
                
                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-40 overflow-y-auto">
                  {filteredFeatures.map((feature) => {
                    const isSelected = selectedFeature?.id === feature.id;
                    return (
                      <button
                        key={feature.id}
                        onClick={() => updateSelectedFeature(feature)}
                        className={`p-3 rounded-lg border-2 transition-all hover:shadow-md text-left ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              feature.status === 'released' ? 'bg-green-500' :
                              feature.status === 'in_development' ? 'bg-yellow-500' : 'bg-gray-500'
                            }`}></div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              feature.impact === 'high' ? 'bg-red-100 text-red-700' :
                              feature.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {feature.impact}
                            </span>
                          </div>
                          {feature.jira_key && (
                            <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                              {feature.jira_key}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm">{feature.title}</h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{feature.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="font-medium text-blue-600">{feature.category}</span>
                          {feature.release_date && (
                            <span>{formatDate(feature.release_date)}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Layout Selection */}
            {selectedTemplate && selectedFeature && (
              <div ref={step3Ref} className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 p-4">
                <div className="flex items-center justify-between cursor-pointer" 
                     onClick={() => setStepsCollapsed(prev => ({...prev, step3: !prev.step3}))}>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-semibold text-gray-900">Step 3: Choose Content Layout</h2>
                      {selectedLayout && stepsCollapsed.step3 && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {selectedLayout.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    {stepsCollapsed.step3 ? (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
                
                {!stepsCollapsed.step3 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-800 mb-3">Select the structure and flow for your {selectedTemplate.name.toLowerCase()}</p>
                  </div>
                )}
                
                {!stepsCollapsed.step3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {contentLayouts.filter(layout => layout.contentTypes.includes(selectedTemplate.type)).map((layout) => {
                    const isSelected = selectedLayout?.id === layout.id;
                    return (
                      <button
                        key={layout.id}
                        onClick={() => updateSelectedLayout(layout)}
                        className={`p-3 rounded-lg border-2 transition-all hover:shadow-md text-left ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="mb-2">
                          <h3 className="font-semibold text-gray-900 mb-1 text-sm">{layout.name}</h3>
                          <p className="text-xs text-gray-600 mb-2">{layout.description}</p>
                        </div>
                        
                        <div className="space-y-1 mb-2">
                          <div className="text-xs text-gray-500 font-medium">Content Structure:</div>
                          <div className="flex flex-wrap gap-1">
                            {layout.sections.slice(0, 6).map((section, index) => (
                              <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-900 rounded">
                                {section.type === 'heading1' ? 'H1' : 
                                 section.type === 'heading2' ? 'H2' : 
                                 section.type === 'heading3' ? 'H3' : 
                                 section.type.charAt(0).toUpperCase() + section.type.slice(1)}
                              </span>
                            ))}
                            {layout.sections.length > 6 && (
                              <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded">
                                +{layout.sections.length - 6}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{layout.sections.length} sections</span>
                          <span>{layout.estimatedLength}</span>
                        </div>
                      </button>
                    );
                  })}
                  </div>
                )}
              </div>
            )}

            {/* Regenerate Content Notification Banner */}
            {showRegenerateNotification && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 shadow-lg animate-pulse"
                   style={{animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 3'}}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">
                        Content needs to be regenerated
                      </h3>
                      <div className="mt-1 text-sm text-amber-700">
                        You've made changes to your content settings. Click "Regenerate Content" to update your content with the new selections.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleRegenerateContent}
                      disabled={isGeneratingAI}
                      className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>{isGeneratingAI ? 'Regenerating...' : 'Regenerate Content'}</span>
                    </button>
                    <button
                      onClick={() => setShowRegenerateNotification(false)}
                      className="text-amber-600 hover:text-amber-800 p-1 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Generate Content Button */}
            {selectedTemplate && selectedFeature && selectedLayout && (
              <div ref={generateButtonRef} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-3">
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => generateRichContent(selectedFeature, selectedTemplate, selectedLayout)}
                    disabled={isGeneratingAI}
                    className="flex items-center space-x-3 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    <Sparkles className={`w-6 h-6 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    <span className="text-lg">
                      {isGeneratingAI ? 'Generating Content...' : 
                       contentGenerated ? 'Regenerate Content' : 'Generate Content'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            
            {/* Generated Content and Preview - Bottom Section */}
            {contentGenerated && richContent && (
              <div ref={generatedContentRef} className="bg-white rounded-xl shadow-lg border border-gray-200/50 mt-4">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Generated Content</h2>
                  <p className="text-sm text-gray-800">Edit and customize your AI-generated {selectedTemplate?.name.toLowerCase()}</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-4">
                  {/* Editor Column */}
                  <div className="lg:col-span-2 space-y-4 h-[800px] overflow-y-auto pr-2">
                    <h3 className="text-md font-semibold text-gray-900">Edit Content</h3>
                    
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Title</label>
                      <textarea
                        value={richContent.title}
                        onChange={(e) => setRichContent({...richContent, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 font-semibold resize-none text-gray-900"
                        rows={2}
                      />
                    </div>
                    
                    {/* Subtitle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Subtitle</label>
                      <textarea
                        value={richContent.subtitle || ''}
                        onChange={(e) => setRichContent({...richContent, subtitle: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 resize-none"
                        rows={3}
                      />
                    </div>
                    
                    {/* Cover Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Cover Image URL</label>
                      <input
                        type="url"
                        value={richContent.coverImage || ''}
                        onChange={(e) => setRichContent({...richContent, coverImage: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    
                    {/* Author Metadata */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Author Information</label>
                      <input
                        type="text"
                        value={richContent.metadata.author}
                        onChange={(e) => setRichContent({...richContent, metadata: {...richContent.metadata, author: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                        placeholder="Author name"
                      />
                    </div>
                    
                    {/* Content Sections Editor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Content Sections</label>
                      <div className="space-y-3">
                        {richContent.sections.map((section, index) => (
                          <div 
                            key={section.id} 
                            ref={(el) => {
                              editSectionRefs.current[section.id] = el;
                            }}
                            onClick={() => focusSection(section.id, false, true)}
                            className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                              focusedSectionId === section.id 
                                ? 'border-blue-500 bg-blue-50 shadow-md' 
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <select
                                value={section.type}
                                onChange={(e) => {
                                  const newSections = [...richContent.sections];
                                  newSections[index].type = e.target.value as any;
                                  setRichContent({...richContent, sections: newSections});
                                }}
                                className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                              >
                                <option value="heading1">Heading 1</option>
                                <option value="heading2">Heading 2</option>
                                <option value="heading3">Heading 3</option>
                                <option value="paragraph">Paragraph</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="quote">Quote</option>
                                <option value="list">List</option>
                                <option value="code">Code Block</option>
                                <option value="divider">Divider</option>
                              </select>
                              <button
                                onClick={() => {
                                  const newSections = richContent.sections.filter((_, i) => i !== index);
                                  setRichContent({...richContent, sections: newSections});
                                }}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            
                            {section.type === 'heading1' && (
                              <textarea
                                value={section.content}
                                onChange={(e) => {
                                  const newSections = [...richContent.sections];
                                  newSections[index].content = e.target.value;
                                  console.log('🔧 EDIT DEBUG: Updating section', index, 'with content:', e.target.value.substring(0, 50) + '...');
                                  setRichContent({...richContent, sections: newSections});
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 resize-y font-bold min-h-[80px]"
                                rows={3}
                                placeholder="Enter main heading..."
                              />
                            )}
                            
                            {section.type === 'heading2' && (
                              <textarea
                                value={section.content}
                                onChange={(e) => {
                                  const newSections = [...richContent.sections];
                                  newSections[index].content = e.target.value;
                                  console.log('🔧 EDIT DEBUG: Updating section', index, 'with content:', e.target.value.substring(0, 50) + '...');
                                  setRichContent({...richContent, sections: newSections});
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 resize-y font-semibold min-h-[80px]"
                                rows={3}
                                placeholder="Enter section heading..."
                              />
                            )}
                            
                            {section.type === 'heading3' && (
                              <textarea
                                value={section.content}
                                onChange={(e) => {
                                  const newSections = [...richContent.sections];
                                  newSections[index].content = e.target.value;
                                  console.log('🔧 EDIT DEBUG: Updating section', index, 'with content:', e.target.value.substring(0, 50) + '...');
                                  setRichContent({...richContent, sections: newSections});
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 resize-y font-medium min-h-[60px]"
                                rows={2}
                                placeholder="Enter subsection heading..."
                              />
                            )}
                            
                            {section.type === 'image' && (
                              <div className="space-y-2">
                                <input
                                  type="url"
                                  value={section.metadata?.src || ''}
                                  onChange={(e) => {
                                    const newSections = [...richContent.sections];
                                    newSections[index].metadata = {
                                      ...newSections[index].metadata,
                                      src: e.target.value
                                    };
                                    setRichContent({...richContent, sections: newSections});
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                                  placeholder="Image URL (https://example.com/image.jpg)..."
                                />
                                <textarea
                                  value={section.metadata?.alt || ''}
                                  onChange={(e) => {
                                    const newSections = [...richContent.sections];
                                    newSections[index].metadata = {
                                      ...newSections[index].metadata,
                                      alt: e.target.value
                                    };
                                    setRichContent({...richContent, sections: newSections});
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 resize-none"
                                  rows={2}
                                  placeholder="Image description/alt text..."
                                />
                                {section.metadata?.src && (
                                  <div className="mt-2 border border-gray-200 rounded-lg p-2">
                                    <img
                                      src={section.metadata.src}
                                      alt={section.metadata.alt}
                                      className="w-full h-32 object-cover rounded"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {section.type === 'video' && (
                              <div className="space-y-2">
                                <input
                                  type="url"
                                  value={section.metadata?.src || ''}
                                  onChange={(e) => {
                                    const newSections = [...richContent.sections];
                                    newSections[index].metadata = {
                                      ...newSections[index].metadata,
                                      src: e.target.value
                                    };
                                    setRichContent({...richContent, sections: newSections});
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                                  placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                                />
                                <input
                                  type="text"
                                  value={section.content || ''}
                                  onChange={(e) => {
                                    const newSections = [...richContent.sections];
                                    newSections[index].content = e.target.value;
                                    setRichContent({...richContent, sections: newSections});
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                                  placeholder="Video description/caption (optional)"
                                />
                                {section.metadata?.src && (
                                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-600 mb-1">Video Preview:</div>
                                    <div className="text-sm text-blue-600 break-all">{section.metadata.src}</div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {section.type === 'code' && (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={section.metadata?.language || ''}
                                  onChange={(e) => {
                                    const newSections = [...richContent.sections];
                                    newSections[index].metadata = {
                                      ...newSections[index].metadata,
                                      language: e.target.value
                                    };
                                    setRichContent({...richContent, sections: newSections});
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                                  placeholder="Programming language (e.g., javascript, python)..."
                                />
                                <textarea
                                  value={section.content}
                                  onChange={(e) => {
                                    const newSections = [...richContent.sections];
                                    newSections[index].content = e.target.value;
                                    setRichContent({...richContent, sections: newSections});
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 resize-both font-mono min-h-[150px] bg-gray-50"
                                  rows={8}
                                  placeholder="Enter code...&#10;&#10;// Example:&#10;function example() {&#10;  return 'Hello World';&#10;}"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Tab') {
                                      e.preventDefault();
                                      const textarea = e.currentTarget;
                                      const start = textarea.selectionStart;
                                      const end = textarea.selectionEnd;
                                      const value = textarea.value;
                                      const newValue = value.substring(0, start) + '  ' + value.substring(end);
                                      textarea.value = newValue;
                                      
                                      const newSections = [...richContent.sections];
                                      newSections[index].content = newValue;
                                      setRichContent({...richContent, sections: newSections});
                                      
                                      textarea.selectionStart = textarea.selectionEnd = start + 2;
                                    }
                                  }}
                                />
                              </div>
                            )}
                            
                            {section.type === 'divider' && (
                              <div className="text-center py-2 text-gray-500">
                                <hr className="border-gray-300" />
                                <span className="text-sm">Visual divider - no content needed</span>
                              </div>
                            )}
                            
                            {section.type === 'list' && (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={section.content}
                                  onChange={(e) => {
                                    const newSections = [...richContent.sections];
                                    newSections[index].content = e.target.value;
                                    setRichContent({...richContent, sections: newSections});
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                                  placeholder="List title..."
                                />
                                <textarea
                                  value={section.metadata?.items?.join('\n') || ''}
                                  onChange={(e) => {
                                    const newSections = [...richContent.sections];
                                    newSections[index].metadata = {
                                      ...newSections[index].metadata,
                                      items: e.target.value.split('\n').filter(item => item.trim())
                                    };
                                    setRichContent({...richContent, sections: newSections});
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 resize-y min-h-[100px]"
                                  rows={6}
                                  placeholder="Enter list items (one per line)...&#10;Item 1&#10;Item 2&#10;Item 3"
                                />
                              </div>
                            )}
                            
                            {section.type === 'paragraph' && (
                              <textarea
                                value={section.content}
                                onChange={(e) => {
                                  const newSections = [...richContent.sections];
                                  newSections[index].content = e.target.value;
                                  console.log('🔧 EDIT DEBUG: Updating section', index, 'with content:', e.target.value.substring(0, 50) + '...');
                                  setRichContent({...richContent, sections: newSections});
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 resize-y min-h-[120px]"
                                rows={6}
                                placeholder="Enter paragraph...&#10;&#10;Use Enter for line breaks&#10;Shift+Enter for paragraph breaks"
                              />
                            )}
                            
                            {section.type === 'quote' && (
                              <div className="space-y-2">
                                <textarea
                                  value={section.content}
                                  onChange={(e) => {
                                    const newSections = [...richContent.sections];
                                    newSections[index].content = e.target.value;
                                    setRichContent({...richContent, sections: newSections});
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 resize-y min-h-[80px]"
                                  rows={4}
                                  placeholder="Enter quote...&#10;Supports multiple lines for longer quotes"
                                />
                                <input
                                  type="text"
                                  value={section.metadata?.author || ''}
                                  onChange={(e) => {
                                    const newSections = [...richContent.sections];
                                    newSections[index].metadata = {
                                      ...newSections[index].metadata,
                                      author: e.target.value
                                    };
                                    setRichContent({...richContent, sections: newSections});
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                                  placeholder="Author name..."
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview Column */}
                  <div className="lg:col-span-3 space-y-4">
                    <h3 className="text-md font-semibold text-gray-900">Live Preview</h3>
                    
                    <div className="bg-gray-50 rounded-lg p-6 h-[750px] overflow-y-auto">
                      {/* Cover Image */}
                      {richContent.coverImage && (
                        <img
                          src={richContent.coverImage}
                          alt="Cover"
                          className="w-full h-48 object-cover rounded-lg mb-6"
                        />
                      )}
                      
                      {/* Title */}
                      <h1 className="text-2xl font-bold text-gray-900 mb-3">{richContent.title}</h1>
                      
                      {/* Subtitle */}
                      {richContent.subtitle && (
                        <p className="text-lg text-gray-600 mb-6">{richContent.subtitle}</p>
                      )}
                      
                      {/* Metadata */}
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6 pb-4 border-b border-gray-200">
                        <span>By {richContent.metadata.author}</span>
                        <span>•</span>
                        <span>{richContent.metadata.readTime} min read</span>
                        <span>•</span>
                        <span>{richContent.metadata.category}</span>
                      </div>
                      
                      {/* Content Sections - All Sections */}
                      <div className="space-y-6">
                        {richContent.sections.map((section) => (
                          <div 
                            key={section.id}
                            ref={(el) => {
                              previewSectionRefs.current[section.id] = el;
                            }}
                            onClick={() => focusSection(section.id, true, false)}
                            className={`cursor-pointer transition-all duration-200 rounded-lg p-2 -m-2 relative group ${
                              focusedSectionId === section.id 
                                ? 'bg-blue-100 ring-2 ring-blue-300 shadow-sm' 
                                : 'hover:bg-blue-50 hover:shadow-sm'
                            }`}
                            title="Click to edit this section"
                          >
                            {section.type === 'heading1' && (
                              <h1 className="text-3xl font-bold text-gray-900 whitespace-pre-wrap">
                                {section.content}
                              </h1>
                            )}
                            
                            {section.type === 'heading2' && (
                              <h2 className="text-2xl font-bold text-gray-900 whitespace-pre-wrap">
                                {section.content}
                              </h2>
                            )}
                            
                            {section.type === 'heading3' && (
                              <h3 className="text-xl font-bold text-gray-900 whitespace-pre-wrap">
                                {section.content}
                              </h3>
                            )}
                            
                            {section.type === 'code' && (
                              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                {section.metadata?.language && (
                                  <div className="text-sm text-gray-400 mb-2">{section.metadata.language}</div>
                                )}
                                <pre className="text-sm">
                                  <code>{section.content}</code>
                                </pre>
                              </div>
                            )}
                            
                            {section.type === 'divider' && (
                              <div className="flex items-center justify-center my-8">
                                <hr className="flex-1 border-gray-300" />
                                <span className="px-4 text-gray-500">•••</span>
                                <hr className="flex-1 border-gray-300" />
                              </div>
                            )}
                            
                            {section.type === 'paragraph' && (
                              <div className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                                {section.content}
                              </div>
                            )}
                            
                            {section.type === 'image' && section.metadata?.src && (
                              <div className="text-center">
                                <img
                                  src={section.metadata.src}
                                  alt={section.metadata.alt}
                                  className="w-full h-64 object-cover rounded-lg mx-auto"
                                />
                                {section.metadata.alt && (
                                  <p className="text-sm text-gray-500 mt-2">{section.metadata.alt}</p>
                                )}
                              </div>
                            )}
                            
                            {section.type === 'video' && section.metadata?.src && (
                              <div className="text-center">
                                <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                  {section.metadata.src.includes('youtube.com') || section.metadata.src.includes('youtu.be') ? (
                                    <iframe
                                      src={section.metadata.src.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                      className="w-full h-full"
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                    />
                                  ) : section.metadata.src.includes('vimeo.com') ? (
                                    <iframe
                                      src={section.metadata.src.replace('vimeo.com/', 'player.vimeo.com/video/')}
                                      className="w-full h-full"
                                      frameBorder="0"
                                      allow="autoplay; fullscreen; picture-in-picture"
                                      allowFullScreen
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full bg-gray-200">
                                      <div className="text-center">
                                        <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">Video Preview</p>
                                        <p className="text-xs text-gray-500 mt-1 break-all px-4">{section.metadata.src}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {section.content && (
                                  <p className="text-sm text-gray-600 mt-2">{section.content}</p>
                                )}
                              </div>
                            )}
                            
                            {section.type === 'quote' && (
                              <blockquote className="border-l-4 border-blue-500 pl-6 italic text-gray-900 bg-blue-50 p-4 rounded-r-lg">
                                <div className="text-lg mb-2 whitespace-pre-wrap">"{section.content}"</div>
                                {section.metadata?.author && (
                                  <cite className="text-sm text-gray-600">— {section.metadata.author}</cite>
                                )}
                              </blockquote>
                            )}
                            
                            {section.type === 'list' && section.metadata?.items && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3 text-lg">{section.content}</h4>
                                <ul className="space-y-2 pl-6">
                                  {section.metadata.items.map((item, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                      <span className="text-gray-900">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Edit Icon - shows on hover */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <div className="bg-blue-600 text-white p-1 rounded-full shadow-lg">
                                <Edit className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200">
                        {richContent.metadata.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-end">
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}