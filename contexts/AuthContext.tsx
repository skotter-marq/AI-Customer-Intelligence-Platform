'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, authHelpers, UserProfile, UserRole, PermissionLevel, AuthContextType } from '../lib/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle case where supabase is not available (build time)
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Get initial session with retry mechanism
    const getInitialSession = async () => {
      try {
        setLoading(true);
        
        // First try to get session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session fetch error:', error);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('✅ Session found, loading user profile...');
          setUser(session.user);
          
          // Load user profile
          const profile = await authHelpers.getUserProfile(session.user.id);
          if (profile) {
            setUserProfile(profile);
            console.log('✅ User profile loaded:', profile.email);
          } else {
            console.warn('⚠️ No user profile found');
          }
        } else {
          console.log('❌ No active session found');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error during session initialization:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes with improved error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email || 'no user');
        
        try {
          if (session?.user) {
            setUser(session.user);
            const profile = await authHelpers.getUserProfile(session.user.id);
            setUserProfile(profile);
          } else {
            setUser(null);
            setUserProfile(null);
          }
          setLoading(false);
        } catch (error) {
          console.error('Error handling auth state change:', error);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const result = await authHelpers.signIn(email, password);
    return result;
  };

  const signOut = async () => {
    await authHelpers.signOut();
    setUser(null);
    setUserProfile(null);
  };

  const hasPermission = (path: string, level: PermissionLevel = 'view'): boolean => {
    if (!userProfile) return false;
    return authHelpers.hasPermission(userProfile.role, path, level);
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signOut,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}