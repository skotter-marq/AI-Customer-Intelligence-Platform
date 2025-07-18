'use client';

import React, { useState, useEffect } from 'react';
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

interface ContentSection {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'video' | 'list' | 'quote' | 'code';
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
  const [featureSearch, setFeatureSearch] = useState('');
  const [richContent, setRichContent] = useState<RichContent | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showRichEditor, setShowRichEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're editing an existing content item
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    const contentType = urlParams.get('type');
    const title = urlParams.get('title');
    const description = urlParams.get('description');
    const featureId = urlParams.get('feature');
    
    if (editId) {
      setEditingId(editId);
      
      // Auto-select template based on content type
      if (contentType) {
        const typeMapping: Record<string, string> = {
          'changelog': 'blog',
          'email': 'newsletter',
          'social': 'blog',
          'case_study': 'case_study',
          'blog': 'blog',
          'press_release': 'press_release',
          'newsletter': 'newsletter'
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
    }
  }, []);

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

  const generateRichContent = async (feature: ProductFeature, template: ContentTemplate) => {
    setIsGeneratingAI(true);
    
    try {
      // Simulate AI generation - replace with actual AI API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const richContent: RichContent = {
        title: `Introducing ${feature.title}: ${feature.business_value}`,
        subtitle: `How ${feature.title} is revolutionizing ${feature.category.toLowerCase()} for ${feature.target_users.join(', ')}`,
        coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
        sections: [
          {
            id: '1',
            type: 'paragraph',
            content: `We're thrilled to announce ${feature.title}, a ${feature.impact}-impact feature that ${feature.description}. This represents a significant step forward in our mission to ${feature.business_value.toLowerCase()}.`
          },
          {
            id: '2',
            type: 'heading',
            content: 'The Challenge',
            metadata: { level: 2 }
          },
          {
            id: '3',
            type: 'paragraph',
            content: `In today's fast-paced business environment, ${feature.target_users.join(', ')} face increasing pressure to ${feature.category.toLowerCase()} more efficiently. Traditional approaches often fall short, leading to bottlenecks and frustration.`
          },
          {
            id: '4',
            type: 'image',
            content: '',
            metadata: {
              src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
              alt: 'Team collaboration and productivity challenges'
            }
          },
          {
            id: '5',
            type: 'heading',
            content: 'Our Solution',
            metadata: { level: 2 }
          },
          {
            id: '6',
            type: 'paragraph',
            content: `${feature.title} addresses these challenges head-on with ${feature.technical_details}. The result? ${feature.business_value}`
          },
          {
            id: '7',
            type: 'list',
            content: 'Key Features',
            metadata: {
              items: [
                `Advanced ${feature.category} capabilities`,
                `Seamless integration with existing workflows`,
                `Real-time collaboration tools`,
                `Enterprise-grade security and compliance`
              ]
            }
          },
          {
            id: '8',
            type: 'heading',
            content: 'Early Results',
            metadata: { level: 2 }
          },
          {
            id: '9',
            type: 'paragraph',
            content: `Early adopters have seen remarkable results. Our beta users report ${feature.metrics?.time_savings || '40% time savings'}, ${feature.metrics?.usage_increase || '60% increased productivity'}, and ${feature.metrics?.customer_satisfaction || '95% satisfaction rate'}.`
          },
          {
            id: '10',
            type: 'quote',
            content: `"${feature.title} has completely transformed how our team works. The efficiency gains are incredible, and the user experience is seamless."`,
            metadata: {
              author: 'Sarah Johnson, Product Manager at TechCorp'
            }
          },
          {
            id: '11',
            type: 'heading',
            content: 'What\'s Next',
            metadata: { level: 2 }
          },
          {
            id: '12',
            type: 'paragraph',
            content: `This is just the beginning. We're already working on the next phase of ${feature.title}, including enhanced analytics, mobile optimization, and deeper integrations. We'd love to hear your feedback as we continue to evolve this feature.`
          }
        ],
        metadata: {
          author: 'Content AI',
          readTime: 8,
          tags: [feature.category, feature.title, ...feature.target_users],
          category: 'Product Updates'
        }
      };
      
      setRichContent(richContent);
      setShowRichEditor(true);
    } catch (error) {
      console.error('Error generating rich content:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/content-pipeline')}
                className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {editingId ? 'Edit Content' : 'Create Content'}
                </h1>
                <p className="text-gray-600">
                  {editingId ? 'Update your content details' : 'Create professional external communications with AI-powered rich content'}
                </p>
              </div>
            </div>
            
            {editingId && (
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Editing Mode
              </div>
            )}
          </div>

          {/* Content Setup */}
          <div className="space-y-8">
            {/* Content Type Selection */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Content Type</h2>
                <p className="text-gray-600">Choose the type of external communication you want to create</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {contentTemplates.map((template) => {
                  const Icon = template.icon;
                  const isSelected = selectedTemplate?.id === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 shadow-lg' 
                          : `border-gray-200 hover:border-gray-300 ${getTemplateColor(template.color)}`
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-4">
                          <Icon className={`w-12 h-12 ${isSelected ? 'text-blue-600' : ''}`} />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          <Clock className="w-3 h-3 mr-1" />
                          {template.estimatedTime}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feature Selection */}
            {selectedTemplate && (
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-8">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Product Feature</h2>
                  <p className="text-gray-600">Choose the feature or release you want to create content about</p>
                </div>
                
                {/* Search */}
                <div className="relative mb-6">
                  <input
                    type="text"
                    value={featureSearch}
                    onChange={(e) => setFeatureSearch(e.target.value)}
                    placeholder="Search for a feature, JIRA ticket, or changelog entry..."
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
                
                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFeatures.map((feature) => {
                    const isSelected = selectedFeature?.id === feature.id;
                    return (
                      <button
                        key={feature.id}
                        onClick={() => setSelectedFeature(feature)}
                        className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg text-left ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              feature.status === 'released' ? 'bg-green-500' :
                              feature.status === 'in_development' ? 'bg-yellow-500' : 'bg-gray-500'
                            }`}></div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              feature.impact === 'high' ? 'bg-red-100 text-red-700' :
                              feature.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {feature.impact} impact
                            </span>
                          </div>
                          {feature.jira_key && (
                            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                              {feature.jira_key}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{feature.description}</p>
                        
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
              </div>
            )}

            {/* Generate Content Button */}
            {selectedTemplate && selectedFeature && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      🚀 Ready to Create Your {selectedTemplate.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Generate a professional {selectedTemplate.name.toLowerCase()} about <span className="font-medium text-blue-600">{selectedFeature.title}</span> with AI-powered rich content, images, and engaging sections.
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Estimated time: {selectedTemplate.estimatedTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Sparkles className="w-4 h-4" />
                        <span>AI-powered generation</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => generateRichContent(selectedFeature, selectedTemplate)}
                    disabled={isGeneratingAI}
                    className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-medium"
                  >
                    <Sparkles className={`w-6 h-6 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingAI ? 'Generating...' : 'Generate Content'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Rich Content Editor */}
          {showRichEditor && richContent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Rich Content Editor</h2>
                    <p className="text-gray-600">Edit your AI-generated {selectedTemplate?.name.toLowerCase()}</p>
                  </div>
                  <button
                    onClick={() => setShowRichEditor(false)}
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(90vh-120px)]">
                  {/* Editor */}
                  <div className="p-6 border-r border-gray-200 overflow-y-auto">
                    <div className="space-y-6">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={richContent.title}
                          onChange={(e) => setRichContent({...richContent, title: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                        />
                      </div>
                      
                      {/* Subtitle */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                        <input
                          type="text"
                          value={richContent.subtitle || ''}
                          onChange={(e) => setRichContent({...richContent, subtitle: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      {/* Cover Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL</label>
                        <input
                          type="url"
                          value={richContent.coverImage || ''}
                          onChange={(e) => setRichContent({...richContent, coverImage: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      
                      {/* Sections */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-sm font-medium text-gray-700">Content Sections</label>
                          <button
                            onClick={() => {
                              const newSection: ContentSection = {
                                id: Date.now().toString(),
                                type: 'paragraph',
                                content: '',
                              };
                              setRichContent({
                                ...richContent,
                                sections: [...richContent.sections, newSection]
                              });
                            }}
                            className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Section</span>
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {richContent.sections.map((section, index) => (
                            <div key={section.id} className="border border-gray-200 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-3">
                                <select
                                  value={section.type}
                                  onChange={(e) => {
                                    const newSections = [...richContent.sections];
                                    newSections[index].type = e.target.value as any;
                                    setRichContent({...richContent, sections: newSections});
                                  }}
                                  className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                >
                                  <option value="heading">Heading</option>
                                  <option value="paragraph">Paragraph</option>
                                  <option value="image">Image</option>
                                  <option value="video">Video</option>
                                  <option value="list">List</option>
                                  <option value="quote">Quote</option>
                                  <option value="code">Code</option>
                                </select>
                                <button
                                  onClick={() => {
                                    const newSections = richContent.sections.filter((_, i) => i !== index);
                                    setRichContent({...richContent, sections: newSections});
                                  }}
                                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {section.type === 'heading' && (
                                <div className="space-y-2">
                                  <select
                                    value={section.metadata?.level || 2}
                                    onChange={(e) => {
                                      const newSections = [...richContent.sections];
                                      newSections[index].metadata = {
                                        ...newSections[index].metadata,
                                        level: parseInt(e.target.value)
                                      };
                                      setRichContent({...richContent, sections: newSections});
                                    }}
                                    className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  >
                                    <option value={1}>H1</option>
                                    <option value={2}>H2</option>
                                    <option value={3}>H3</option>
                                  </select>
                                  <input
                                    type="text"
                                    value={section.content}
                                    onChange={(e) => {
                                      const newSections = [...richContent.sections];
                                      newSections[index].content = e.target.value;
                                      setRichContent({...richContent, sections: newSections});
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter heading text..."
                                  />
                                </div>
                              )}
                              
                              {section.type === 'paragraph' && (
                                <textarea
                                  value={section.content}
                                  onChange={(e) => {
                                    const newSections = [...richContent.sections];
                                    newSections[index].content = e.target.value;
                                    setRichContent({...richContent, sections: newSections});
                                  }}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Enter paragraph text..."
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Image URL..."
                                  />
                                  <input
                                    type="text"
                                    value={section.metadata?.alt || ''}
                                    onChange={(e) => {
                                      const newSections = [...richContent.sections];
                                      newSections[index].metadata = {
                                        ...newSections[index].metadata,
                                        alt: e.target.value
                                      };
                                      setRichContent({...richContent, sections: newSections});
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Alt text..."
                                  />
                                </div>
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
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Quote text..."
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Author..."
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div className="p-6 bg-gray-50 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
                      
                      {/* Cover Image */}
                      {richContent.coverImage && (
                        <img
                          src={richContent.coverImage}
                          alt="Cover"
                          className="w-full h-48 object-cover rounded-lg mb-6"
                        />
                      )}
                      
                      {/* Title */}
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{richContent.title}</h1>
                      
                      {/* Subtitle */}
                      {richContent.subtitle && (
                        <p className="text-xl text-gray-600 mb-6">{richContent.subtitle}</p>
                      )}
                      
                      {/* Metadata */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-8 pb-4 border-b border-gray-200">
                        <span>By {richContent.metadata.author}</span>
                        <span>•</span>
                        <span>{richContent.metadata.readTime} min read</span>
                        <span>•</span>
                        <span>{richContent.metadata.category}</span>
                      </div>
                      
                      {/* Content Sections */}
                      <div className="space-y-6">
                        {richContent.sections.map((section) => (
                          <div key={section.id}>
                            {section.type === 'heading' && (
                              <div className={`font-bold text-gray-900 ${
                                section.metadata?.level === 1 ? 'text-3xl' :
                                section.metadata?.level === 2 ? 'text-2xl' : 'text-xl'
                              }`}>
                                {section.content}
                              </div>
                            )}
                            
                            {section.type === 'paragraph' && (
                              <p className="text-gray-700 leading-relaxed">{section.content}</p>
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
                            
                            {section.type === 'quote' && (
                              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 bg-blue-50 p-4 rounded-r-lg">
                                <p className="mb-2">"{section.content}"</p>
                                {section.metadata?.author && (
                                  <cite className="text-sm text-gray-600">— {section.metadata.author}</cite>
                                )}
                              </blockquote>
                            )}
                            
                            {section.type === 'list' && section.metadata?.items && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3">{section.content}</h4>
                                <ul className="space-y-2 pl-6">
                                  {section.metadata.items.map((item, index) => (
                                    <li key={index} className="flex items-start space-x-2">
                                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                      <span className="text-gray-700">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
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
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowRichEditor(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        // Copy content to clipboard
                        const content = `# ${richContent.title}\n\n${richContent.subtitle ? richContent.subtitle + '\n\n' : ''}${richContent.sections.map(s => s.content).join('\n\n')}`;
                        navigator.clipboard.writeText(content);
                        alert('Content copied to clipboard!');
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={() => {
                        // Save and close
                        setShowRichEditor(false);
                        alert('Rich content saved!');
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save & Close</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}