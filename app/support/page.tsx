'use client';

import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Search,
  Filter,
  HeadphonesIcon,
  User,
  Mail,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  Tag,
  ArrowUpDown,
  Grid3X3,
  List,
  Download,
  Eye,
  MessageSquare,
  Phone,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Star
} from 'lucide-react';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  customer_name: string;
  customer_email: string;
  customer_company: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed';
  channel: 'email' | 'chat' | 'phone' | 'form';
  assigned_agent: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  first_response_time: number; // minutes
  resolution_time?: number; // minutes
  satisfaction_rating?: number;
  tags: string[];
  escalated: boolean;
  category: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  interaction_count: number;
  last_customer_message: string;
}

interface SupportMetrics {
  total_tickets: number;
  open_tickets: number;
  avg_response_time: number;
  avg_resolution_time: number;
  satisfaction_score: number;
  escalation_rate: number;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [metrics, setMetrics] = useState<SupportMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | 'email' | 'chat' | 'phone' | 'form'>('all');
  const [agentFilter, setAgentFilter] = useState<'all' | string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'priority' | 'status'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock support tickets data
  const mockTickets: SupportTicket[] = [
    {
      id: 'ticket-001',
      subject: 'API Integration Issues - Production Downtime',
      description: 'Customer experiencing API timeout errors causing production system downtime. Urgent resolution needed.',
      customer_name: 'Robert Kim',
      customer_email: 'robert.kim@globalcorp.com',
      customer_company: 'GlobalCorp',
      priority: 'urgent',
      status: 'in_progress',
      channel: 'phone',
      assigned_agent: 'Sarah Johnson',
      created_at: '2024-01-15T09:30:00Z',
      updated_at: '2024-01-15T11:45:00Z',
      first_response_time: 15,
      tags: ['API', 'Production', 'Integration', 'Urgent'],
      escalated: true,
      category: 'Technical',
      sentiment: 'negative',
      interaction_count: 5,
      last_customer_message: '2024-01-15T11:30:00Z'
    },
    {
      id: 'ticket-002',
      subject: 'Feature Request - Bulk Data Export',
      description: 'Customer requesting ability to export large datasets in CSV format for analysis.',
      customer_name: 'Lisa Wong',
      customer_email: 'lisa.wong@techstart.com',
      customer_company: 'TechStart Inc',
      priority: 'medium',
      status: 'open',
      channel: 'email',
      assigned_agent: 'Mike Chen',
      created_at: '2024-01-14T14:20:00Z',
      updated_at: '2024-01-14T16:30:00Z',
      first_response_time: 45,
      tags: ['Feature Request', 'Export', 'CSV'],
      escalated: false,
      category: 'Feature',
      sentiment: 'positive',
      interaction_count: 2,
      last_customer_message: '2024-01-14T16:15:00Z'
    },
    {
      id: 'ticket-003',
      subject: 'Billing Inquiry - Invoice Discrepancy',
      description: 'Customer questioning charges on latest invoice. Requesting detailed breakdown.',
      customer_name: 'John Smith',
      customer_email: 'john.smith@marketingcorp.com',
      customer_company: 'MarketingCorp',
      priority: 'low',
      status: 'pending_customer',
      channel: 'chat',
      assigned_agent: 'Jennifer Park',
      created_at: '2024-01-13T10:15:00Z',
      updated_at: '2024-01-14T09:20:00Z',
      first_response_time: 30,
      tags: ['Billing', 'Invoice', 'Accounting'],
      escalated: false,
      category: 'Billing',
      sentiment: 'neutral',
      interaction_count: 3,
      last_customer_message: '2024-01-13T15:45:00Z'
    },
    {
      id: 'ticket-004',
      subject: 'Login Issues - Password Reset Not Working',
      description: 'Multiple users unable to reset passwords. Email notifications not being received.',
      customer_name: 'Emma Davis',
      customer_email: 'emma.davis@startupxyz.com',
      customer_company: 'StartupXYZ',
      priority: 'high',
      status: 'resolved',
      channel: 'form',
      assigned_agent: 'Alex Thompson',
      created_at: '2024-01-12T16:45:00Z',
      updated_at: '2024-01-13T10:30:00Z',
      resolved_at: '2024-01-13T10:30:00Z',
      first_response_time: 20,
      resolution_time: 1065, // ~18 hours
      satisfaction_rating: 4,
      tags: ['Login', 'Password', 'Authentication'],
      escalated: false,
      category: 'Technical',
      sentiment: 'positive',
      interaction_count: 4,
      last_customer_message: '2024-01-13T09:15:00Z'
    }
  ];

  // Mock metrics
  const mockMetrics: SupportMetrics = {
    total_tickets: 156,
    open_tickets: 23,
    avg_response_time: 28, // minutes
    avg_resolution_time: 4.2, // hours
    satisfaction_score: 4.1,
    escalation_rate: 8.5 // percentage
  };

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setTickets(mockTickets);
      setMetrics(mockMetrics);
      setLoading(false);
    }, 1000);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'calendly-badge-danger';
      case 'high': return 'calendly-badge-warning';
      case 'medium': return 'calendly-badge-info';
      case 'low': return 'calendly-badge-success';
      default: return 'calendly-badge-info';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'calendly-badge-warning';
      case 'in_progress': return 'calendly-badge-info';
      case 'pending_customer': return 'calendly-badge-warning';
      case 'resolved': return 'calendly-badge-success';
      case 'closed': return 'calendly-badge-info';
      default: return 'calendly-badge-info';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'calendly-badge-success';
      case 'neutral': return 'calendly-badge-info';
      case 'negative': return 'calendly-badge-danger';
      default: return 'calendly-badge-info';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return Mail;
      case 'chat': return MessageCircle;
      case 'phone': return Phone;
      case 'form': return MessageSquare;
      default: return MessageCircle;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !searchQuery || 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer_company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || ticket.channel === channelFilter;
    const matchesAgent = agentFilter === 'all' || ticket.assigned_agent === agentFilter;
    
    return matchesSearch && matchesPriority && matchesStatus && matchesChannel && matchesAgent;
  });

  const handleTicketClick = (ticketId: string) => {
    console.log('View ticket:', ticketId);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#4285f4' }}></div>
                <p className="calendly-body mt-4">Loading support data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6" style={{ background: '#f8fafc' }}>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
            <div>
              <h1 className="calendly-h1">Support</h1>
              <p className="calendly-body">Customer support tickets and service metrics</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="calendly-btn-secondary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4" style={{ marginBottom: '24px' }}>
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Total Tickets</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{metrics?.total_tickets}</p>
                </div>
                <HeadphonesIcon className="w-8 h-8" style={{ color: '#4285f4' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Open</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{metrics?.open_tickets}</p>
                </div>
                <AlertCircle className="w-8 h-8" style={{ color: '#f59e0b' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Avg Response</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{metrics?.avg_response_time}m</p>
                </div>
                <Clock className="w-8 h-8" style={{ color: '#10b981' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Avg Resolution</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{metrics?.avg_resolution_time}h</p>
                </div>
                <CheckCircle className="w-8 h-8" style={{ color: '#10b981' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Satisfaction</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{metrics?.satisfaction_score}/5</p>
                </div>
                <Star className="w-8 h-8" style={{ color: '#f59e0b' }} />
              </div>
            </div>
            
            <div className="calendly-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="calendly-label" style={{ marginBottom: '4px' }}>Escalation Rate</p>
                  <p className="calendly-h2" style={{ marginBottom: 0 }}>{metrics?.escalation_rate}%</p>
                </div>
                <TrendingUp className="w-8 h-8" style={{ color: '#ef4444' }} />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="calendly-card" style={{ marginBottom: '24px' }}>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#718096' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tickets, customers, or descriptions..."
                    className="w-full pl-12 pr-4 py-3 calendly-body-sm transition-all duration-200"
                    style={{ 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: 'white'
                    }}
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
              </div>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                  style={{ border: '1px solid #e2e8f0', background: 'white' }}
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                  style={{ border: '1px solid #e2e8f0', background: 'white' }}
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending_customer">Pending Customer</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value as any)}
                  className="px-3 py-2 calendly-body-sm rounded-lg transition-all duration-200"
                  style={{ border: '1px solid #e2e8f0', background: 'white' }}
                >
                  <option value="all">All Channels</option>
                  <option value="email">Email</option>
                  <option value="chat">Chat</option>
                  <option value="phone">Phone</option>
                  <option value="form">Form</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-2 transition-all duration-200 ${viewMode === 'cards' ? 'text-white' : 'calendly-body-sm'}`}
                    style={viewMode === 'cards' ? { background: '#4285f4' } : { color: '#718096' }}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-2 transition-all duration-200 ${viewMode === 'table' ? 'text-white' : 'calendly-body-sm'}`}
                    style={viewMode === 'table' ? { background: '#4285f4' } : { color: '#718096' }}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets Display */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTickets.map((ticket) => {
                const ChannelIcon = getChannelIcon(ticket.channel);
                return (
                  <div
                    key={ticket.id}
                    onClick={() => handleTicketClick(ticket.id)}
                    className="calendly-card cursor-pointer transition-all duration-200"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)';
                    }}
                  >
                    {/* Ticket Header */}
                    <div className="flex items-start justify-between" style={{ marginBottom: '12px' }}>
                      <div className="flex-1">
                        <h3 className="calendly-h3" style={{ marginBottom: '4px' }}>{ticket.subject}</h3>
                        <p className="calendly-label-sm">{ticket.customer_name} • {ticket.customer_company}</p>
                      </div>
                      <div className="flex flex-col space-y-1 ml-4">
                        <span className={`calendly-badge ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`calendly-badge ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Ticket Details */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600" style={{ marginBottom: '12px' }}>
                      <div className="flex items-center space-x-1">
                        <ChannelIcon className="w-4 h-4" />
                        <span>{ticket.channel}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{ticket.assigned_agent}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{ticket.interaction_count} replies</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="calendly-body-sm line-clamp-2" style={{ marginBottom: '16px' }}>
                      {ticket.description}
                    </p>

                    {/* Tags */}
                    <div style={{ marginBottom: '16px' }}>
                      <div className="flex flex-wrap gap-2">
                        {ticket.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                        {ticket.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{ticket.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                      <div className="flex items-center space-x-2">
                        <span className={`calendly-badge ${getSentimentColor(ticket.sentiment)}`}>
                          {ticket.sentiment}
                        </span>
                        {ticket.escalated && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            Escalated
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="calendly-label-sm">
                          {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                        </span>
                        <ExternalLink className="w-4 h-4" style={{ color: '#718096' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="calendly-card" style={{ padding: 0 }}>
              <div className="overflow-x-auto">
                <table className="calendly-table">
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Customer</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Channel</th>
                      <th>Agent</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => {
                      const ChannelIcon = getChannelIcon(ticket.channel);
                      return (
                        <tr key={ticket.id} className="cursor-pointer" onClick={() => handleTicketClick(ticket.id)}>
                          <td>
                            <div>
                              <div className="font-medium">{ticket.subject}</div>
                              <div className="text-sm text-gray-600 line-clamp-1">{ticket.description}</div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="font-medium">{ticket.customer_name}</div>
                              <div className="text-sm text-gray-600">{ticket.customer_company}</div>
                            </div>
                          </td>
                          <td>
                            <span className={`calendly-badge ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td>
                            <span className={`calendly-badge ${getStatusColor(ticket.status)}`}>
                              {ticket.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center space-x-2">
                              <ChannelIcon className="w-4 h-4" style={{ color: '#718096' }} />
                              <span>{ticket.channel}</span>
                            </div>
                          </td>
                          <td>{ticket.assigned_agent}</td>
                          <td>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</td>
                          <td>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTicketClick(ticket.id);
                              }}
                              className="p-1 rounded transition-colors"
                              style={{ color: '#718096' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f1f5f9';
                                e.currentTarget.style.color = '#4285f4';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#718096';
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredTickets.length === 0 && (
            <div className="calendly-card text-center py-12">
              <HeadphonesIcon className="w-16 h-16 mx-auto mb-4" style={{ color: '#a0aec0' }} />
              <h3 className="calendly-h3" style={{ marginBottom: '8px' }}>No tickets found</h3>
              <p className="calendly-body" style={{ marginBottom: '24px' }}>
                {searchQuery || priorityFilter !== 'all' || statusFilter !== 'all' || channelFilter !== 'all'
                  ? 'Try adjusting your search or filters' 
                  : 'Support tickets will appear here as they are created'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}