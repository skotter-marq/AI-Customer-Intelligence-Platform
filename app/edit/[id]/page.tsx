'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface ContentItem {
  id: string;
  content_title: string;
  generated_content: string;
  content_type: string;
  target_audience: string;
  status: string;
  approval_status: string;
  quality_score: number;
  created_at: string;
  updated_at: string;
  tldr_summary?: string;
  tldr_bullet_points?: string[];
  last_edited_by?: string;
  last_edited_at?: string;
  version_number?: number;
  is_draft?: boolean;
}

interface ContentVersion {
  id: string;
  content_id: string;
  version_number: number;
  title: string;
  created_at: string;
  created_by: string;
  changes_summary: string;
  is_current: boolean;
}

export default function ContentEditPage() {
  const params = useParams();
  const router = useRouter();
  const contentId = params?.id as string;

  const [content, setContent] = useState<ContentItem | null>(null);
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editorName, setEditorName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    content_title: '',
    generated_content: '',
    tldr_summary: '',
    tldr_bullet_points: [] as string[],
    content_type: '',
    target_audience: ''
  });

  // Fetch content data
  useEffect(() => {
    if (contentId) {
      fetchContent();
      fetchVersions();
    }
  }, [contentId]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && hasUnsavedChanges && editorName.trim()) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(timer);
    }
  }, [hasUnsavedChanges, autoSaveEnabled, editorName, formData]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/content-edit?content_id=${contentId}&action=get`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const data = await response.json();
      setContent(data.content);
      
      // Initialize form data
      setFormData({
        content_title: data.content.content_title || '',
        generated_content: data.content.generated_content || '',
        tldr_summary: data.content.tldr_summary || '',
        tldr_bullet_points: data.content.tldr_bullet_points || [],
        content_type: data.content.content_type || '',
        target_audience: data.content.target_audience || ''
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const response = await fetch(`/api/content-edit?content_id=${contentId}&action=get_versions`);
      
      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions || []);
      }
    } catch (err) {
      console.error('Failed to fetch versions:', err);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleBulletPointChange = (index: number, value: string) => {
    const newBulletPoints = [...formData.tldr_bullet_points];
    newBulletPoints[index] = value;
    handleInputChange('tldr_bullet_points', newBulletPoints);
  };

  const addBulletPoint = () => {
    handleInputChange('tldr_bullet_points', [...formData.tldr_bullet_points, '']);
  };

  const removeBulletPoint = (index: number) => {
    const newBulletPoints = formData.tldr_bullet_points.filter((_, i) => i !== index);
    handleInputChange('tldr_bullet_points', newBulletPoints);
  };

  const saveDraft = async () => {
    if (!editorName.trim()) {
      alert('Please enter your name before saving');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/content-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save_draft',
          contentId,
          editorId: editorName,
          updates: formData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      const result = await response.json();
      
      if (result.success) {
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        setContent(result.content);
      }
    } catch (err) {
      console.error('Error saving draft:', err);
      alert('Failed to save draft. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const saveContent = async (asDraft: boolean = false) => {
    if (!editorName.trim()) {
      alert('Please enter your name before saving');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/content-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          contentId,
          editorId: editorName,
          updates: formData,
          saveAsDraft: asDraft
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      const result = await response.json();
      
      if (result.success) {
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        setContent(result.content);
        
        if (!asDraft) {
          alert('Content saved successfully! It will be submitted for review.');
        }
      }
    } catch (err) {
      console.error('Error saving content:', err);
      alert('Failed to save content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'changes_requested': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content editor...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Content</h2>
          <p className="text-gray-600">{error || 'Content not found'}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Content Editor</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(content.status)}`}>
                      {content.status}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getApprovalStatusColor(content.approval_status)}`}>
                      {content.approval_status}
                    </span>
                    {content.is_draft && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        Draft
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {lastSaved && (
                  <div className="text-sm text-gray-500">
                    Last saved: {formatDistanceToNow(lastSaved, { addSuffix: true })}
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {showPreview ? 'Edit' : 'Preview'}
                  </button>
                  <button
                    onClick={() => setShowVersions(!showVersions)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Versions ({versions.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Editor Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Editor Name
                    </label>
                    <input
                      type="text"
                      value={editorName}
                      onChange={(e) => setEditorName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto-save"
                      checked={autoSaveEnabled}
                      onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                      className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="auto-save" className="text-sm text-gray-700">
                      Auto-save (every 30s)
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => saveDraft()}
                    disabled={saving || !editorName.trim()}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button
                    onClick={() => saveContent(false)}
                    disabled={saving || !editorName.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save & Submit'}
                  </button>
                </div>
              </div>
              
              {hasUnsavedChanges && (
                <div className="mt-2 text-sm text-orange-600">
                  ⚠️ You have unsaved changes
                </div>
              )}
            </div>

            {showPreview ? (
              /* Preview Mode */
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Preview</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {formData.content_title || 'Untitled'}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <span>Type: {formData.content_type}</span>
                      <span>Audience: {formData.target_audience}</span>
                    </div>
                  </div>

                  {formData.tldr_summary && (
                    <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">TL;DR</h4>
                      <p className="text-sm text-blue-800">{formData.tldr_summary}</p>
                    </div>
                  )}

                  {formData.tldr_bullet_points.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Key Points:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {formData.tldr_bullet_points.map((point, index) => (
                          <li key={index} className="text-sm text-gray-700">{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">
                      {formData.generated_content || 'No content yet...'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <div className="space-y-6">
                {/* Title */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.content_title}
                    onChange={(e) => handleInputChange('content_title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter content title..."
                  />
                </div>

                {/* Content Type & Audience */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Type
                      </label>
                      <select
                        value={formData.content_type}
                        onChange={(e) => handleInputChange('content_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="feature_release">Feature Release</option>
                        <option value="bug_fix">Bug Fix</option>
                        <option value="security_update">Security Update</option>
                        <option value="performance_improvement">Performance Improvement</option>
                        <option value="integration_update">Integration Update</option>
                        <option value="product_announcement">Product Announcement</option>
                        <option value="customer_communication">Customer Communication</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Audience
                      </label>
                      <select
                        value={formData.target_audience}
                        onChange={(e) => handleInputChange('target_audience', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="customers">Customers</option>
                        <option value="prospects">Prospects</option>
                        <option value="developers">Developers</option>
                        <option value="internal_team">Internal Team</option>
                        <option value="media">Media</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* TL;DR Summary */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TL;DR Summary
                  </label>
                  <textarea
                    value={formData.tldr_summary}
                    onChange={(e) => handleInputChange('tldr_summary', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief summary of the content..."
                  />
                </div>

                {/* Bullet Points */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Key Points
                    </label>
                    <button
                      onClick={addBulletPoint}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add Point
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.tldr_bullet_points.map((point, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={point}
                          onChange={(e) => handleBulletPointChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter key point..."
                        />
                        <button
                          onClick={() => removeBulletPoint(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.generated_content}
                    onChange={(e) => handleInputChange('generated_content', e.target.value)}
                    rows={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Enter your content here..."
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    {formData.generated_content.length} characters
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Content Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Content Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quality Score:</span>
                  <span className="font-medium">{(content.quality_score * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">{content.version_number || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}</span>
                </div>
                {content.last_edited_by && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last edited by:</span>
                    <span className="font-medium">{content.last_edited_by}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Version History */}
            {showVersions && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Version History</h3>
                <div className="space-y-3">
                  {versions.map((version) => (
                    <div key={version.id} className="border border-gray-200 rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">v{version.version_number}</span>
                        {version.is_current && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{version.changes_summary}</p>
                      <div className="text-xs text-gray-500">
                        {version.created_by} • {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}