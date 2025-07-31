'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, authHelpers, UserProfile, UserRole, PermissionLevel, AuthContextType } from '../lib/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Handle case where supabase is not available (build time)
    if (!supabase) {
      setLoading(false);
      setAuthError('Authentication service unavailable');
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let isCancelled = false;

    // Set a timeout to prevent infinite loading
    const authTimeout = setTimeout(() => {
      if (!isCancelled) {
        console.warn('⏰ Authentication timeout - forcing fallback');
        setLoading(false);
        setAuthError('Authentication timed out. Please refresh the page.');
      }
    }, 10000); // 10 second timeout

    // Get initial session with retry mechanism
    const getInitialSession = async () => {
      try {
        if (isCancelled) return;
        
        setLoading(true);
        setAuthError(null);
        
        // First try to get session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error('Session fetch timeout')), 5000);
        });
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (timeoutId) clearTimeout(timeoutId);
        if (isCancelled) return;
        
        if (error) {
          console.error('Session fetch error:', error);
          setAuthError(`Authentication error: ${error.message}`);
          setLoading(false);
          clearTimeout(authTimeout); // Clear the timeout on error
          return;
        }
        
        if (session?.user) {
          console.log('✅ Session found, loading user profile...');
          setUser(session.user);
          
          // Load user profile with timeout
          try {
            const profile = await Promise.race([
              authHelpers.getUserProfile(session.user.id),
              new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 3000))
            ]);
            
            if (profile && !isCancelled) {
              setUserProfile(profile);
              console.log('✅ User profile loaded:', profile.email);
            } else if (!isCancelled) {
              console.warn('⚠️ No user profile found');
              setAuthError('Unable to load user profile');
            }
          } catch (profileError) {
            console.error('Profile fetch error:', profileError);
            if (!isCancelled) {
              setAuthError('Failed to load user profile');
            }
          }
        } else {
          console.log('❌ No active session found');
        }
        
        if (!isCancelled) {
          setLoading(false);
          clearTimeout(authTimeout); // Clear the timeout on successful completion
        }
      } catch (error) {
        console.error('Error during session initialization:', error);
        if (!isCancelled) {
          setAuthError(error instanceof Error ? error.message : 'Authentication failed');
          setLoading(false);
          clearTimeout(authTimeout); // Clear the timeout on error
        }
      }
    };

    getInitialSession();

    // Cleanup function
    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (authTimeout) clearTimeout(authTimeout);
    };

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
    authError,
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