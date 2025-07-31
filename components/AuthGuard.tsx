'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PermissionLevel } from '../lib/auth';
import { usePathname } from 'next/navigation';
import { Shield, Lock } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredPermission?: PermissionLevel;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ 
  children, 
  requiredPermission = 'view',
  fallback 
}: AuthGuardProps) {
  const { user, userProfile, loading, hasPermission } = useAuth();
  const pathname = usePathname();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // User not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Authentication Required</h2>
            <p className="text-gray-600 mt-2">Please sign in to access this page.</p>
          </div>
          <button
            onClick={() => {
              console.log('Redirecting to login...');
              window.location.href = '/login';
            }}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // User authenticated but no profile (shouldn't happen with proper setup)
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Error</h2>
          <p className="text-gray-600 mb-4">Unable to load user profile. Please contact administrator.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check permissions for current path
  if (!hasPermission(pathname, requiredPermission)) {
    const defaultFallback = (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <Lock className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Current role: <span className="font-medium">{userProfile.role}</span>
            </p>
            <p className="text-sm text-gray-500">
              Required permission: <span className="font-medium">{requiredPermission}</span>
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="mt-4 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );

    return fallback || defaultFallback;
  }

  // User has permission, render children
  return <>{children}</>;
}

// Higher-order component for page-level protection
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: PermissionLevel = 'view'
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard requiredPermission={requiredPermission}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}