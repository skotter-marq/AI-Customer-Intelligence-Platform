'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  Send,
  CheckCircle,
  AlertTriangle,
  Settings,
  Play,
  Download,
  Bell,
  Users,
  Activity,
  BarChart3,
  Clock,
  Zap,
  Globe,
  RefreshCw,
  Hash,
  Terminal,
  Bot
} from 'lucide-react';

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
      case 'approval': return Bell;
      case 'notification': return MessageSquare;
      case 'summary': return BarChart3;
      default: return Bot;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'approval': return 'calendly-badge-info';
      case 'notification': return 'calendly-badge-success';
      case 'summary': return 'calendly-badge-warning';
      default: return 'calendly-badge-info';
    }
  };

  return (
    <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
            <div>
              <h1 className="calendly-h1">Slack Integration</h1>
              <p className="calendly-body">Manage Slack bot notifications and commands</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full`} style={{ background: isConnected ? '#10b981' : '#ef4444' }}></div>
                <span className="calendly-body-sm">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="calendly-label-sm">
                {notifications.length} recent notifications
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Total Notifications</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{stats.total_notifications}</p>
                </div>
                <Send className="w-8 h-8" style={{ color: '#4285f4' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Successful</p>
                  <p className="calendly-h2" style={{ marginBottom: 0, color: '#10b981' }}>{stats.successful_notifications}</p>
                </div>
                <CheckCircle className="w-8 h-8" style={{ color: '#10b981' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Failed</p>
                  <p className="calendly-h2" style={{ marginBottom: 0, color: '#ef4444' }}>{stats.failed_notifications}</p>
                </div>
                <AlertTriangle className="w-8 h-8" style={{ color: '#ef4444' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Active Channels</p>
                  <p className="calendly-h2" style={{ marginBottom: 0, color: '#4285f4' }}>{stats.channels_active}</p>
                </div>
                <Hash className="w-8 h-8" style={{ color: '#4285f4' }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Controls */}
            <div className="lg:col-span-1 space-y-6">
              {/* Test Notification */}
              <div className="calendly-card">
                <h3 className="calendly-h3" style={{ marginBottom: '16px' }}>Send Test Notification</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="calendly-label" style={{ marginBottom: '8px', display: 'block' }}>
                      Channel
                    </label>
                    <select
                      value={testChannel}
                      onChange={(e) => setTestChannel(e.target.value)}
                      className="w-full px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                      style={{ border: '1px solid #e2e8f0', background: 'white' }}
                    >
                      <option value="#content-updates">#content-updates</option>
                      <option value="#content-approvals">#content-approvals</option>
                      <option value="#general">#general</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="calendly-label" style={{ marginBottom: '8px', display: 'block' }}>
                      Message
                    </label>
                    <textarea
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                      style={{ border: '1px solid #e2e8f0', background: 'white' }}
                      placeholder="Enter your test message..."
                      onFocus={(e) => {
                        e.target.style.borderColor = '#4285f4';
                        e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  
                  <button
                    onClick={sendTestNotification}
                    disabled={loading || !testMessage.trim()}
                    className={`calendly-btn-primary w-full flex items-center justify-center space-x-2 ${(loading || !testMessage.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Sending...' : 'Send Test Message'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="calendly-card">
                <h3 className="calendly-h3" style={{ marginBottom: '16px' }}>Quick Actions</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={sendDailySummary}
                    disabled={loading}
                    className={`calendly-btn-secondary w-full flex items-center justify-center space-x-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Send Daily Summary</span>
                  </button>
                  
                  <button
                    onClick={() => window.open('/api/slack?command=/content-stats', '_blank')}
                    className="calendly-btn-secondary w-full flex items-center justify-center space-x-2"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Test /content-stats</span>
                  </button>
                  
                  <button
                    onClick={() => alert('Feature coming soon!')}
                    className="calendly-btn-secondary w-full flex items-center justify-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Configure Bot</span>
                  </button>
                </div>
              </div>

              {/* Slash Commands */}
              <div className="calendly-card">
                <h3 className="calendly-h3" style={{ marginBottom: '16px' }}>Available Commands</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Terminal className="w-4 h-4" style={{ color: '#718096' }} />
                    <div className="flex-1">
                      <code className="calendly-label-sm" style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>/content-stats</code>
                      <p className="calendly-label-sm" style={{ marginTop: '2px' }}>Show pipeline statistics</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Terminal className="w-4 h-4" style={{ color: '#718096' }} />
                    <div className="flex-1">
                      <code className="calendly-label-sm" style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>/content-pending</code>
                      <p className="calendly-label-sm" style={{ marginTop: '2px' }}>List pending approvals</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Terminal className="w-4 h-4" style={{ color: '#718096' }} />
                    <div className="flex-1">
                      <code className="calendly-label-sm" style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>/content-help</code>
                      <p className="calendly-label-sm" style={{ marginTop: '2px' }}>Show help message</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Notification History */}
            <div className="lg:col-span-2">
              <div className="calendly-card">
                <h3 className="calendly-h3" style={{ marginBottom: '16px' }}>Recent Notifications</h3>
                
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
                    <p className="calendly-body">No notifications sent yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => {
                      const NotificationIcon = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className="transition-all duration-200 rounded-lg p-4"
                          style={{ border: '1px solid #e2e8f0', background: 'white' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                                <NotificationIcon className="w-5 h-5" style={{ color: '#4285f4' }} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2" style={{ marginBottom: '8px' }}>
                                  <span className={`calendly-badge ${getNotificationColor(notification.type)}`}>
                                    {notification.type}
                                  </span>
                                  <span className="calendly-label-sm flex items-center space-x-1">
                                    <Hash className="w-3 h-3" />
                                    <span>{notification.channel}</span>
                                  </span>
                                </div>
                                <p className="calendly-body" style={{ marginBottom: '8px' }}>{notification.message}</p>
                                <div className="flex items-center space-x-4">
                                  <span className="calendly-label-sm flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatDistanceToNow(new Date(notification.sent_at), { addSuffix: true })}</span>
                                  </span>
                                  <span className={`calendly-label-sm flex items-center space-x-1`} style={{ color: notification.success ? '#10b981' : '#ef4444' }}>
                                    {notification.success ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                    <span>{notification.success ? 'Sent' : 'Failed'}</span>
                                  </span>
                                </div>
                                {notification.error && (
                                  <div className="mt-2 calendly-label-sm" style={{ color: '#ef4444' }}>
                                    Error: {notification.error}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}