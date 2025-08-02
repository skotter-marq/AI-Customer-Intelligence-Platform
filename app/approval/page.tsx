'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface ApprovalContent {
  id: string;
  content_title: string;
  generated_content: string;
  content_type: string;
  target_audience: string;
  status: string;
  quality_score: number;
  created_at: string;
  updated_at: string;
  tldr_summary?: string;
  approval_status: string;
  reviewer_id?: string;
  review_comments?: string;
  review_date?: string;
  tags?: string[];
  source_data?: any;
}

interface ApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  changes_requested: number;
  total: number;
}

export default function ApprovalPage() {
  const [content, setContent] = useState<ApprovalContent[]>([]);
  const [stats, setStats] = useState<ApprovalStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    changes_requested: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [selectedContent, setSelectedContent] = useState<ApprovalContent | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const getTagOptions = () => [
    'Announcement',
    'Bug fix', 
    'Improvement',
    'New feature',
    'Developers',
    'Convert',
    'AI Agent',
    'Performance',
    'Integration',
    'UI/UX',
    'API',
    'Mobile',
    'Enterprise'
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  // Fetch approval content
  useEffect(() => {
    fetchApprovalContent();
  }, [selectedStatus]);

  const fetchApprovalContent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/approval?status=${selectedStatus}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch approval content');
      }
      
      const data = await response.json();
      setContent(data.content || []);
      setStats(data.stats || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load approval content');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (action: 'approve' | 'reject' | 'request_changes', contentId: string) => {
    if (!reviewerName.trim()) {
      alert('Please enter your name as reviewer');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          contentId,
          reviewerId: reviewerName,
          comments: reviewComments,
          changes: action === 'request_changes' ? ['Please review and improve content'] : undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process approval action');
      }

      const result = await response.json();
      
      if (result.success) {
        // Refresh the content list
        await fetchApprovalContent();
        
        // Clear form
        setSelectedContent(null);
        setReviewComments('');
        
        // Show success message
        alert(`Content ${action.replace('_', ' ')} successfully!`);
      } else {
        throw new Error(result.error || 'Action failed');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to process action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'changes_requested': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQualityIndicator = (score: number) => {
    if (score >= 0.8) return { color: 'text-green-600', label: 'High Quality' };
    if (score >= 0.6) return { color: 'text-yellow-600', label: 'Good Quality' };
    return { color: 'text-red-600', label: 'Needs Improvement' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading approval dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Approval Dashboard</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
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
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Content Approval Dashboard</h1>
                <p className="mt-2 text-gray-600">
                  Review and approve AI-generated content before publication
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {content.length} items for review
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.changes_requested}</div>
            <div className="text-sm text-gray-600">Changes Requested</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'pending', label: 'Pending Review', count: stats.pending },
                { key: 'approved', label: 'Approved', count: stats.approved },
                { key: 'rejected', label: 'Rejected', count: stats.rejected },
                { key: 'changes_requested', label: 'Changes Requested', count: stats.changes_requested }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedStatus === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Reviewer Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reviewer Name
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-sm text-gray-500">
              Required for all approval actions
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="space-y-6">
          {content.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No content found</h3>
              <p className="text-gray-600">
                No content with status "{selectedStatus}" at the moment.
              </p>
            </div>
          ) : (
            content.map((item) => {
              const quality = getQualityIndicator(item.quality_score);
              
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {item.content_title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.approval_status)}`}>
                            {item.approval_status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <span className="text-sm text-gray-500">
                            Type: {item.content_type}
                          </span>
                          <span className="text-sm text-gray-500">
                            Audience: {item.target_audience}
                          </span>
                          <span className={`text-sm font-medium ${quality.color}`}>
                            Quality: {quality.label}
                          </span>
                          <span className="text-sm text-gray-500">
                            Created: {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                          </span>
                        </div>

                        {item.tldr_summary && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Summary</h4>
                            <p className="text-sm text-blue-800">{item.tldr_summary}</p>
                          </div>
                        )}

                        <div className="prose prose-sm max-w-none text-gray-700">
                          <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                            {item.generated_content}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Quality Score</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {(item.quality_score * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          item.quality_score >= 0.8 ? 'bg-green-500' :
                          item.quality_score >= 0.6 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                      </div>
                    </div>

                    {/* Review Actions */}
                    {item.approval_status === 'pending' && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Review Comments
                          </label>
                          <textarea
                            value={selectedContent?.id === item.id ? reviewComments : ''}
                            onChange={(e) => {
                              if (selectedContent?.id === item.id) {
                                setReviewComments(e.target.value);
                              } else {
                                setSelectedContent(item);
                                setReviewComments(e.target.value);
                              }
                            }}
                            placeholder="Add comments about this content..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                          />
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => window.open(`/edit/${item.id}`, '_blank')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleApprovalAction('approve', item.id)}
                            disabled={isSubmitting || !reviewerName.trim()}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleApprovalAction('request_changes', item.id)}
                            disabled={isSubmitting || !reviewerName.trim()}
                            className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ↻ Request Changes
                          </button>
                          <button
                            onClick={() => handleApprovalAction('reject', item.id)}
                            disabled={isSubmitting || !reviewerName.trim()}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Review Info */}
                    {item.approval_status !== 'pending' && item.reviewer_id && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Reviewed by:</span> {item.reviewer_id}
                          {item.review_date && (
                            <span className="ml-2">
                              on {formatDistanceToNow(new Date(item.review_date), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        {item.review_comments && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                            <span className="font-medium">Comments:</span> {item.review_comments}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}