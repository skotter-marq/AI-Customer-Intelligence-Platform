'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface SlackNotification {
  id: string;
  type: 'approval' | 'notification' | 'summary';
  message: string;
  channel: string;
  sent_at: string;
  success: boolean;
  error?: string;
}

interface SlackStats {
  total_notifications: number;
  successful_notifications: number;
  failed_notifications: number;
  channels_active: number;
  last_notification: string;
}

export default function SlackIntegrationPage() {
  const [notifications, setNotifications] = useState<SlackNotification[]>([]);
  const [stats, setStats] = useState<SlackStats>({
    total_notifications: 0,
    successful_notifications: 0,
    failed_notifications: 0,
    channels_active: 0,
    last_notification: ''
  });
  const [loading, setLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testChannel, setTestChannel] = useState('#content-updates');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    setNotifications([
      {
        id: '1',
        type: 'approval',
        message: 'New content ready for approval: API Rate Limiting Feature',
        channel: '#content-approvals',
        sent_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        success: true
      },
      {
        id: '2',
        type: 'notification',
        message: 'Content approved: Dashboard Performance Improvements',
        channel: '#content-updates',
        sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        success: true
      },
      {
        id: '3',
        type: 'summary',
        message: 'Daily Content Pipeline Summary sent',
        channel: '#content-updates',
        sent_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        success: true
      }
    ]);

    setStats({
      total_notifications: 47,
      successful_notifications: 45,
      failed_notifications: 2,
      channels_active: 2,
      last_notification: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    });

    // Check connection status (mock)
    setIsConnected(true);
  }, []);

  const sendTestNotification = async () => {
    if (!testMessage.trim()) {
      alert('Please enter a test message');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/slack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_notification',
          message: testMessage,
          channel: testChannel,
          type: 'info'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const result = await response.json();
      
      if (result.success) {
        // Add to notifications list
        const newNotification: SlackNotification = {
          id: Date.now().toString(),
          type: 'notification',
          message: testMessage,
          channel: testChannel,
          sent_at: new Date().toISOString(),
          success: true
        };

        setNotifications(prev => [newNotification, ...prev]);
        setTestMessage('');
        
        alert('Test notification sent successfully!');
      } else {
        throw new Error(result.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('Failed to send test notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendDailySummary = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/slack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'daily_summary'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send daily summary');
      }

      const result = await response.json();
      
      if (result.success) {
        const newNotification: SlackNotification = {
          id: Date.now().toString(),
          type: 'summary',
          message: 'Daily Content Pipeline Summary',
          channel: '#content-updates',
          sent_at: new Date().toISOString(),
          success: true
        };

        setNotifications(prev => [newNotification, ...prev]);
        alert('Daily summary sent successfully!');
      } else {
        throw new Error(result.error || 'Failed to send daily summary');
      }
    } catch (error) {
      console.error('Error sending daily summary:', error);
      alert('Failed to send daily summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval': return '📋';
      case 'notification': return '💬';
      case 'summary': return '📊';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'approval': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'notification': return 'bg-green-100 text-green-800 border-green-200';
      case 'summary': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Slack Integration</h1>
                <p className="mt-2 text-gray-600">
                  Manage Slack bot notifications and commands
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {notifications.length} recent notifications
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl">📨</div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.total_notifications}</div>
                <div className="text-sm text-gray-600">Total Notifications</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl">✅</div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-green-600">{stats.successful_notifications}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl">❌</div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-red-600">{stats.failed_notifications}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl">📺</div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-blue-600">{stats.channels_active}</div>
                <div className="text-sm text-gray-600">Active Channels</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Test Notification */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Send Test Notification</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Channel
                  </label>
                  <select
                    value={testChannel}
                    onChange={(e) => setTestChannel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="#content-updates">#content-updates</option>
                    <option value="#content-approvals">#content-approvals</option>
                    <option value="#general">#general</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter your test message..."
                  />
                </div>
                
                <button
                  onClick={sendTestNotification}
                  disabled={loading || !testMessage.trim()}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Test Message'}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={sendDailySummary}
                  disabled={loading}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📊 Send Daily Summary
                </button>
                
                <button
                  onClick={() => window.open('/api/slack?command=/content-stats', '_blank')}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  📈 Test /content-stats
                </button>
                
                <button
                  onClick={() => alert('Feature coming soon!')}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  ⚙️ Configure Bot
                </button>
              </div>
            </div>

            {/* Slash Commands */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Available Commands</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded">/content-stats</code>
                  <span className="text-gray-600">Show pipeline statistics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded">/content-pending</code>
                  <span className="text-gray-600">List pending approvals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded">/content-help</code>
                  <span className="text-gray-600">Show help message</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Notification History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Notifications</h3>
              
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📭</div>
                  <p className="text-gray-600">No notifications sent yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getNotificationColor(notification.type)}`}>
                                {notification.type}
                              </span>
                              <span className="text-sm text-gray-600">
                                {notification.channel}
                              </span>
                            </div>
                            <p className="text-gray-900 mb-2">{notification.message}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                {formatDistanceToNow(new Date(notification.sent_at), { addSuffix: true })}
                              </span>
                              <span className={`flex items-center ${notification.success ? 'text-green-600' : 'text-red-600'}`}>
                                {notification.success ? '✅ Sent' : '❌ Failed'}
                              </span>
                            </div>
                            {notification.error && (
                              <div className="mt-2 text-sm text-red-600">
                                Error: {notification.error}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}