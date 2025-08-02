'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface ChangelogEntry {
  id: string;
  content_title: string;
  generated_content: string;
  content_type: string;
  status: string;
  quality_score: number;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  public_changelog_visible: boolean;
  version?: string;
  release_date?: string;
  approved_by?: string;
}

interface PublicChangelogStats {
  total_entries: number;
  public_entries: number;
  visible_entries: number;
  pending_entries: number;
  published_entries: number;
}

export default function PublicChangelogAdminPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [stats, setStats] = useState<PublicChangelogStats>({
    total_entries: 0,
    public_entries: 0,
    visible_entries: 0,
    pending_entries: 0,
    published_entries: 0
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'public' | 'private' | 'visible'>('all');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/public-changelog');
      
      if (!response.ok) {
        throw new Error('Failed to fetch changelog entries');
      }
      
      const data = await response.json();
      setEntries(data.entries || []);
      setStats(data.stats || stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  const updateEntry = async (entryId: string, updates: Partial<ChangelogEntry>) => {
    try {
      setUpdating(entryId);
      const response = await fetch('/api/admin/public-changelog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          entryId,
          updates
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update entry');
      }

      // Refresh entries
      await fetchEntries();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update entry');
    } finally {
      setUpdating(null);
    }
  };

  const togglePublicVisibility = (entry: ChangelogEntry) => {
    const newPublicState = !entry.is_public;
    const updates: Partial<ChangelogEntry> = {
      is_public: newPublicState,
      public_changelog_visible: newPublicState
    };

    // If making public and no release date, set it to now
    if (newPublicState && !entry.release_date) {
      updates.release_date = new Date().toISOString();
    }

    // If making public and no version, generate one
    if (newPublicState && !entry.version) {
      const date = new Date();
      updates.version = `v${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate()}`;
    }

    updateEntry(entry.id, updates);
  };

  const setChangelogVisibility = (entry: ChangelogEntry, visible: boolean) => {
    updateEntry(entry.id, { public_changelog_visible: visible });
  };

  const getStatusColor = (entry: ChangelogEntry) => {
    if (entry.is_public && entry.public_changelog_visible) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (entry.is_public) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (entry: ChangelogEntry) => {
    if (entry.is_public && entry.public_changelog_visible) {
      return 'Public & Visible';
    } else if (entry.is_public) {
      return 'Public Only';
    } else {
      return 'Private';
    }
  };

  const filteredEntries = entries.filter(entry => {
    switch (filter) {
      case 'public': return entry.is_public;
      case 'private': return !entry.is_public;
      case 'visible': return entry.is_public && entry.public_changelog_visible;
      default: return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading changelog entries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Entries</h2>
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
                <div className="flex items-center space-x-4">
                  <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                    ← Back to Admin
                  </Link>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">Public Changelog Management</h1>
                <p className="mt-2 text-gray-600">
                  Manage which changelog entries are visible in the public changelog
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/api/public-changelog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  View Public API
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.total_entries}</div>
            <div className="text-sm text-gray-600">Total Entries</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.public_entries}</div>
            <div className="text-sm text-gray-600">Public</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">{stats.visible_entries}</div>
            <div className="text-sm text-gray-600">Publicly Visible</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_entries}</div>
            <div className="text-sm text-gray-600">Draft</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.published_entries}</div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all' as const, label: 'All Entries', count: entries.length },
                { key: 'visible' as const, label: 'Publicly Visible', count: stats.visible_entries },
                { key: 'public' as const, label: 'Public Only', count: stats.public_entries },
                { key: 'private' as const, label: 'Private', count: stats.total_entries - stats.public_entries }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
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

        {/* Entries List */}
        <div className="space-y-6">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No entries found</h3>
              <p className="text-gray-600">
                No entries match the current filter "{filter}".
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {entry.content_title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(entry)}`}>
                          {getStatusText(entry)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-3">
                        <span className="text-sm text-gray-500">
                          Status: {entry.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          Quality: {(entry.quality_score * 100).toFixed(0)}%
                        </span>
                        <span className="text-sm text-gray-500">
                          Created: {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                        </span>
                        {entry.version && (
                          <span className="text-sm text-gray-500">
                            Version: {entry.version}
                          </span>
                        )}
                      </div>

                      <div className="prose prose-sm max-w-none text-gray-700 mb-4">
                        <div className="bg-gray-50 p-3 rounded-md">
                          {entry.generated_content.substring(0, 200)}
                          {entry.generated_content.length > 200 && '...'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => togglePublicVisibility(entry)}
                      disabled={updating === entry.id}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        entry.is_public
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      } disabled:opacity-50`}
                    >
                      {updating === entry.id ? 'Updating...' : 
                       entry.is_public ? 'Make Private' : 'Make Public'}
                    </button>

                    {entry.is_public && (
                      <button
                        onClick={() => setChangelogVisibility(entry, !entry.public_changelog_visible)}
                        disabled={updating === entry.id}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          entry.public_changelog_visible
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        } disabled:opacity-50`}
                      >
                        {entry.public_changelog_visible ? 'Hide from Changelog' : 'Show in Changelog'}
                      </button>
                    )}

                    <Link
                      href={`/edit/${entry.id}`}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
                    >
                      Edit
                    </Link>
                  </div>

                  {/* Entry Details */}
                  {(entry.release_date || entry.approved_by) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600 grid grid-cols-2 gap-4">
                        {entry.release_date && (
                          <div>
                            <span className="font-medium">Release Date:</span>{' '}
                            {new Date(entry.release_date).toLocaleDateString()}
                          </div>
                        )}
                        {entry.approved_by && (
                          <div>
                            <span className="font-medium">Approved By:</span>{' '}
                            {entry.approved_by}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}