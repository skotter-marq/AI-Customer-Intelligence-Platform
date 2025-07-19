'use client';

import { useState, useEffect } from 'react';
import { 
  Search,
  FileText,
  Settings,
  Bell,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
}


interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  color: string;
  href: string;
}

interface RecentInsight {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  category: string;
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Add initial welcome message
    setMessages([
      {
        id: 'welcome',
        type: 'assistant',
        content: 'Hi! I\'m your AI Customer Intelligence assistant. I can help you analyze customer data, generate insights, and answer questions about your business. What would you like to explore today?',
        timestamp: new Date().toISOString(),
        sources: []
      }
    ]);
  }, []);

  const quickActions: QuickAction[] = [
    {
      id: 'customer-search',
      title: 'Customer Search',
      description: 'Find and analyze customer data',
      icon: Search,
      count: 1247,
      color: 'blue',
      href: '/cs-query'
    },
    {
      id: 'content-creation',
      title: 'Content Creation',
      description: 'Generate marketing content',
      icon: FileText,
      count: 12,
      color: 'green',
      href: '/approval'
    },
    {
      id: 'system-monitoring',
      title: 'System Monitor',
      description: 'Check system performance',
      icon: Settings,
      count: 3,
      color: 'purple',
      href: '/monitoring'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'View recent alerts',
      icon: Bell,
      count: 7,
      color: 'orange',
      href: '/notifications'
    }
  ];

  const recentInsights: RecentInsight[] = [
    {
      id: '1',
      title: 'Customer Churn Risk Alert',
      description: 'TechCorp showing signs of decreased engagement',
      priority: 'high',
      timestamp: '2 hours ago',
      category: 'Customer Success'
    },
    {
      id: '2',
      title: 'Feature Request Trend',
      description: 'API export functionality requested by 15 customers',
      priority: 'medium',
      timestamp: '4 hours ago',
      category: 'Product'
    },
    {
      id: '3',
      title: 'Positive Feedback Spike',
      description: 'Dashboard improvements receiving great reviews',
      priority: 'low',
      timestamp: '6 hours ago',
      category: 'Success'
    }
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const mockResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateMockResponse(inputMessage),
        timestamp: new Date().toISOString(),
        sources: ['HubSpot CRM', 'Supabase Analytics']
      };
      setMessages(prev => [...prev, mockResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateMockResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('customer') || lowerQuery.includes('risk')) {
      return 'I found 3 customers showing signs of churn risk. TechCorp has the highest risk score with decreased usage by 60% over the past 2 weeks. I recommend immediate outreach to understand any issues they\'re facing.';
    }
    
    if (lowerQuery.includes('feature') || lowerQuery.includes('request')) {
      return 'The top feature request is API export functionality, requested by 15 enterprise customers. This represents a significant opportunity to improve retention and unlock upsell potential.';
    }
    
    return 'I\'m analyzing your request across all integrated systems. I can help you with customer analysis, feature requests, content generation, or system monitoring. What specific area would you like to explore?';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return AlertCircle;
      case 'medium': return Clock;
      case 'low': return CheckCircle;
      default: return Star;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface - 2/3 width */}
            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 h-[600px] flex flex-col">
                <div className="p-6 border-b border-gray-200/50">
                  <h2 className="text-xl font-semibold text-gray-900">AI Assistant</h2>
                  <p className="text-gray-600">Ask me anything about your customers or business</p>
                </div>
                
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="text-sm">{message.content}</div>
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-2 text-xs opacity-75">
                            Sources: {message.sources.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 rounded-2xl px-4 py-3 max-w-xs">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <span className="text-xs">Analyzing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Input */}
                <div className="p-6 border-t border-gray-200/50">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isTyping}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isTyping || !inputMessage.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - 1/3 width */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <a
                        key={action.id}
                        href={action.href}
                        className="block p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                              action.color === 'green' ? 'bg-green-100 text-green-600' :
                              action.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                              'bg-orange-100 text-orange-600'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {action.title}
                              </div>
                              <div className="text-xs text-gray-600">{action.description}</div>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-gray-900">
                            {action.count}
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Recent Insights */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h3>
                <div className="space-y-3">
                  {recentInsights.map((insight) => {
                    const PriorityIcon = getPriorityIcon(insight.priority);
                    return (
                      <div
                        key={insight.id}
                        className="p-4 rounded-xl border border-gray-200 hover:bg-gray-50/50 transition-all"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getPriorityColor(insight.priority)}`}>
                            <PriorityIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-sm">{insight.title}</div>
                            <div className="text-xs text-gray-600 mt-1">{insight.description}</div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">{insight.category}</span>
                              <span className="text-xs text-gray-500">{insight.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}