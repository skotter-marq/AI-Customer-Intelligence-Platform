import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// User roles and permissions
export const USER_ROLES = {
  ADMIN: 'admin',
  CS_USER: 'cs_user'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Page permissions mapping
export const PAGE_PERMISSIONS = {
  '/': { admin: 'full', cs_user: 'view' },
  '/agents': { admin: 'full', cs_user: 'create' }, // CS can create their own agents
  '/competitors': { admin: 'full', cs_user: 'view' },
  '/content-pipeline': { admin: 'full', cs_user: 'view' },
  '/meetings': { admin: 'full', cs_user: 'none' },
  '/product': { admin: 'full', cs_user: 'view' },
  '/workflows': { admin: 'full', cs_user: 'full' }, // Apps marketplace
  '/changelog': { admin: 'full', cs_user: 'view' },
  '/admin': { admin: 'full', cs_user: 'none' }
} as const;

export type PermissionLevel = 'full' | 'view' | 'create' | 'none';

// User profile interface
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_sign_in?: string;
  is_active: boolean;
}

// Auth helper functions
export const authHelpers = {
  // Get current user session
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Get user profile with role
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  },

  // Check if user has permission for a page
  hasPermission: (userRole: UserRole, path: string, requiredLevel: PermissionLevel = 'view'): boolean => {
    // Find matching page permission (check for exact match first, then parent paths)
    let pageKey = path;
    let permission = PAGE_PERMISSIONS[pageKey as keyof typeof PAGE_PERMISSIONS];
    
    // If no exact match, try parent paths
    if (!permission) {
      const pathParts = path.split('/').filter(p => p);
      for (let i = pathParts.length; i > 0; i--) {
        const testPath = '/' + pathParts.slice(0, i).join('/');
        permission = PAGE_PERMISSIONS[testPath as keyof typeof PAGE_PERMISSIONS];
        if (permission) break;
      }
    }

    // Default to no access if no permission found
    if (!permission) return false;

    const userPermission = permission[userRole];
    if (!userPermission || userPermission === 'none') return false;

    // Check permission levels
    switch (requiredLevel) {
      case 'view':
        return ['view', 'create', 'full'].includes(userPermission);
      case 'create':
        return ['create', 'full'].includes(userPermission);
      case 'full':
        return userPermission === 'full';
      default:
        return false;
    }
  },

  // Sign in user
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  // Sign up user (admin only)
  signUp: async (email: string, password: string, fullName: string, role: UserRole = USER_ROLES.CS_USER) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    });

    if (error) throw error;
    return data;
  },

  // Sign out user
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Update user profile
  updateUserProfile: async (userId: string, updates: Partial<UserProfile>) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Get all users (admin only)
  getAllUsers: async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data || [];
  },

  // Deactivate user (admin only)
  deactivateUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    return data;
  }
};

// Auth context hook (to be used with React Context)
export interface AuthContextType {
  user: any;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  hasPermission: (path: string, level?: PermissionLevel) => boolean;
}