import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Type definitions
export interface User {
  id: string;
  email: string;
  email_confirmed_at?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    role?: string;
  };
}

export interface AuthResponse {
  success: boolean;
  user?: User | null;
  error?: string;
  session?: unknown;
}
