import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Handle missing environment variables during build
export function createSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    // Return null during build time when env vars aren't available
    return null;
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Singleton instance
export const supabase = createSupabaseClient();