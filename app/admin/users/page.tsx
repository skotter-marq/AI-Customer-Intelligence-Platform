'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users,
  Plus,
  Search,
  MoreVertical,
  Shield,
  Mail,
  Calendar,
  Eye,
  UserX,
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';
import { authHelpers, UserProfile, USER_ROLES, UserRole } from '../../../lib/auth';
import { useAuth } from '../../../contexts/AuthContext';

interface UserWithActions extends UserProfile {
  actionsOpen?: boolean;
}

export default function UsersPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserWithActions[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const breadcrumbItems = [
    { label: 'Admin Settings', href: '/admin/settings' },
    { label: 'User Management', current: true }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await authHelpers.getAllUsers();
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading users:', error);
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleActions = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, actionsOpen: !user.actionsOpen }
        : { ...user, actionsOpen: false }
    ));
  };

  const handleDeactivateUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await authHelpers.deactivateUser(userId);
        await loadUsers();
      } catch (error) {
        console.error('Error deactivating user:', error);
      }
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cs_user':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatRole = (role: UserRole) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-4" style={{ background: '#f8fafc' }}>
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Settings className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="calendly-body text-gray-600">Loading users...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-4" style={{ background: '#f8fafc' }}>
      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="calendly-h2">User Management</h1>
              <p className="calendly-body text-gray-600 mt-2">
                Manage user accounts, roles, and permissions for your team.
              </p>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="calendly-button calendly-button-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Invite User</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 calendly-card">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{filteredUsers.length} users</span>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="calendly-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Last Sign In</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                          <Shield className="w-3 h-3 mr-1" />
                          {formatRole(user.role)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1">
                          {user.is_active ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-700">Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-red-700">Inactive</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {user.last_sign_in ? formatDate(user.last_sign_in) : 'Never'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="relative">
                          <button
                            onClick={() => toggleActions(user.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {user.actionsOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button
                                onClick={() => {
                                  toggleActions(user.id);
                                  router.push(`/admin/users/${user.id}`);
                                }}
                                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Details</span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  toggleActions(user.id);
                                  router.push(`/admin/users/${user.id}/permissions`);
                                }}
                                className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Shield className="w-4 h-4" />
                                <span>Manage Permissions</span>
                              </button>
                              
                              {user.is_active && user.id !== userProfile?.id && (
                                <button
                                  onClick={() => {
                                    toggleActions(user.id);
                                    handleDeactivateUser(user.id);
                                  }}
                                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                >
                                  <UserX className="w-4 h-4" />
                                  <span>Deactivate</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="calendly-h3 text-gray-600 mb-2">No users found</h3>
              <p className="calendly-body text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Start by inviting your first team member.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="calendly-button calendly-button-primary flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Invite User</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invite User Modal would go here */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Invite New User</h3>
            <p className="text-sm text-gray-600 mb-4">
              Feature coming soon. For now, contact your system administrator to add new users.
            </p>
            <button
              onClick={() => setShowInviteModal(false)}
              className="calendly-button calendly-button-primary w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}