'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationHistory {
  id: string;
  type: string;
  subject: string;
  sent_at: string;
  channels: string[];
  status: string;
  recipients: string[];
}

interface NotificationStats {
  total_sent: number;
  successful_deliveries: number;
  failed_deliveries: number;
  channels_used: {
    email: number;
    slack: number;
    webhook: number;
    sms: number;
    in_app: number;
  };
  top_notification_types: {
    [key: string]: number;
  };
}

interface NotificationPreferences {
  userId: string;
  email_enabled: boolean;
  slack_enabled: boolean;
  webhook_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  notification_types: {
    approval_request: boolean;
    content_published: boolean;
    content_rejected: boolean;
    system_alert: boolean;
    daily_summary: boolean;
  };
  priority_threshold: string;
  quiet_hours: {
    enabled: boolean;
    start_time: string;
    end_time: string;
    timezone: string;
  };
}

export default function NotificationsPage() {
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'preferences' | 'test'>('overview');
  const [testChannel, setTestChannel] = useState<string>('email');
  const [testMessage, setTestMessage] = useState('');
  const [userId, setUserId] = useState('user1');

  useEffect(() => {
    loadNotificationData();
  }, []);

  const loadNotificationData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const statsResponse = await fetch('/api/notifications?type=stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      // Load history
      const historyResponse = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_history' })
      });
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.history);
      }

      // Load preferences
      const preferencesResponse = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_preferences', userId })
      });
      if (preferencesResponse.ok) {
        const preferencesData = await preferencesResponse.json();
        setPreferences(preferencesData.preferences);
      }

    } catch (error) {
      console.error('Error loading notification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updatedPreferences: NotificationPreferences) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_preferences',
          userId,
          preferences: updatedPreferences
        })
      });

      if (response.ok) {
        setPreferences(updatedPreferences);
        alert('Preferences updated successfully!');
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      alert('Failed to update preferences. Please try again.');
    }
  };

  const testNotificationChannel = async () => {
    if (!testMessage.trim()) {
      alert('Please enter a test message');
      return;
    }

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_channel',
          channelType: testChannel,
          userId
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Test notification sent via ${testChannel}!`);
        setTestMessage('');
      } else {
        throw new Error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Error testing notification channel:', error);
      alert('Failed to send test notification. Please try again.');
    }
  };

  const sendCustomNotification = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          type: 'system_alert',
          priority: 'medium',
          recipients: [userId],
          message: {
            subject: testMessage,
            body: testMessage,
            type: 'system_alert'
          }
        })
      });

      if (response.ok) {
        alert('Custom notification sent successfully!');
        await loadNotificationData(); // Refresh data
      } else {
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending custom notification:', error);
      alert('Failed to send notification. Please try again.');
    }
  };

  const getChannelIcon = (channel: string) => {
    const icons = {
      email: '📧',
      slack: '💬',
      webhook: '🔗',
      sms: '📱',
      in_app: '🔔'
    };
    return icons[channel as keyof typeof icons] || '📋';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'approval_request': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'content_published': return 'bg-green-100 text-green-800 border-green-200';
      case 'content_rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'system_alert': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'daily_summary': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notification system...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Notification Routing System</h1>
                <p className="mt-2 text-gray-600">
                  Manage notification preferences and routing across all channels
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {stats?.total_sent || 0} notifications sent
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: '📊' },
              { key: 'history', label: 'History', icon: '📋' },
              { key: 'preferences', label: 'Preferences', icon: '⚙️' },
              { key: 'test', label: 'Test', icon: '🧪' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="text-3xl">📨</div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">{stats.total_sent}</div>
                    <div className="text-sm text-gray-600">Total Sent</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="text-3xl">✅</div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-green-600">{stats.successful_deliveries}</div>
                    <div className="text-sm text-gray-600">Delivered</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="text-3xl">❌</div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-red-600">{stats.failed_deliveries}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="text-3xl">📊</div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {((stats.successful_deliveries / stats.total_sent) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Channels Usage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Channel Usage</h3>
                <div className="space-y-3">
                  {Object.entries(stats.channels_used).map(([channel, count]) => (
                    <div key={channel} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getChannelIcon(channel)}</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">{channel}</span>
                      </div>
                      <div className="text-sm text-gray-600">{count} notifications</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Types</h3>
                <div className="space-y-3">
                  {Object.entries(stats.top_notification_types).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(type)}`}>
                        {type.replace('_', ' ')}
                      </span>
                      <div className="text-sm text-gray-600">{count} notifications</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification History</h3>
            
            {history.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📭</div>
                <p className="text-gray-600">No notifications found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((notification) => (
                  <div key={notification.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(notification.type)}`}>
                            {notification.type.replace('_', ' ')}
                          </span>
                          <span className={`text-sm font-medium ${getStatusColor(notification.status)}`}>
                            {notification.status}
                          </span>
                        </div>
                        <h4 className="text-gray-900 font-medium mb-2">{notification.subject}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            {formatDistanceToNow(new Date(notification.sent_at), { addSuffix: true })}
                          </span>
                          <span>
                            {notification.recipients.length} recipients
                          </span>
                          <div className="flex items-center space-x-1">
                            {notification.channels.map((channel) => (
                              <span key={channel} className="text-lg">
                                {getChannelIcon(channel)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && preferences && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
            
            <div className="space-y-6">
              {/* User Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user1">user1</option>
                  <option value="user2">user2</option>
                  <option value="user3">user3</option>
                </select>
              </div>

              {/* Channel Preferences */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Channels</h4>
                <div className="space-y-2">
                  {Object.entries(preferences).filter(([key]) => key.endsWith('_enabled')).map(([key, enabled]) => {
                    const channel = key.replace('_enabled', '');
                    return (
                      <label key={key} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={enabled as boolean}
                          onChange={(e) => {
                            setPreferences({
                              ...preferences,
                              [key]: e.target.checked
                            });
                          }}
                          className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-lg">{getChannelIcon(channel)}</span>
                        <span className="text-sm text-gray-700 capitalize">{channel}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Notification Types */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Types</h4>
                <div className="space-y-2">
                  {Object.entries(preferences.notification_types).map(([type, enabled]) => (
                    <label key={type} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => {
                          setPreferences({
                            ...preferences,
                            notification_types: {
                              ...preferences.notification_types,
                              [type]: e.target.checked
                            }
                          });
                        }}
                        className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  onClick={() => updatePreferences(preferences)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test Tab */}
        {activeTab === 'test' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Test Notifications</h3>
            
            <div className="space-y-6">
              {/* Test Channel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Channel
                </label>
                <select
                  value={testChannel}
                  onChange={(e) => setTestChannel(e.target.value)}
                  className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="email">📧 Email</option>
                  <option value="slack">💬 Slack</option>
                  <option value="webhook">🔗 Webhook</option>
                  <option value="sms">📱 SMS</option>
                  <option value="in_app">🔔 In-App</option>
                </select>
              </div>

              {/* Test Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Message
                </label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your test message..."
                />
              </div>

              {/* Test Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={testNotificationChannel}
                  disabled={!testMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test Channel
                </button>
                <button
                  onClick={sendCustomNotification}
                  disabled={!testMessage.trim()}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Full Notification
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}