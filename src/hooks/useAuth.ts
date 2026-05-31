'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, type User } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false
  });
  const mounted = useRef(false);

  // Update auth state
  const updateAuthState = useCallback((user: User | null, isAdmin: boolean = false) => {
    if (!mounted.current) return;
    setState({
      user,
      isLoading: false,
      isAuthenticated: !!user,
      isAdmin
    });
  }, []);

  // Handle session data
  const handleSession = useCallback((session: { user: User; isAdmin: boolean } | null) => {
    if (session) {
      updateAuthState(session.user, session.isAdmin);
    } else {
      updateAuthState(null);
    }
  }, [updateAuthState]);

  // Get current session
  const getSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        updateAuthState(null);
        return;
      }

      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          email_confirmed_at: session.user.email_confirmed_at,
          user_metadata: session.user.user_metadata as User['user_metadata']
        };
        const isAdminRole = session.user.user_metadata?.role === 'admin';
        handleSession({ user: userData, isAdmin: isAdminRole });
      } else {
        handleSession(null);
      }
    } catch (error) {
      console.error('Failed to get session:', error);
      updateAuthState(null);
    }
  }, [handleSession, updateAuthState]);

  useEffect(() => {
    mounted.current = true;

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted.current) return;
        
        if (event === 'SIGNED_IN' && session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            email_confirmed_at: session.user.email_confirmed_at,
            user_metadata: session.user.user_metadata as User['user_metadata']
          };

          setState(prev => ({
            ...prev,
            user: userData,
            isAuthenticated: true,
            isAdmin: session.user.user_metadata?.role === 'admin'
          }));
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            isAdmin: false
          });
        }
      }
    );

    // Fetch initial session after setting up listener using queueMicrotask
    // to avoid calling setState synchronously within the effect
    queueMicrotask(() => {
      getSession();
    });

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, [getSession]);

  // Sign up with email
  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user && !data.session) {
        // Email confirmation required
        return { 
          success: true, 
          message: 'Please check your email to confirm your account.' 
        };
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  // Sign in with email
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  // Sign in with OAuth provider
  const signInWithProvider = useCallback(async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('OAuth error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        isAdmin: false
      });

      router.push('/login');
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, [router]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Password reset email sent!' };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (metadata: Record<string, unknown>) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Update local state
      if (data.user) {
        setState(prev => ({
          ...prev,
          user: prev.user ? {
            ...prev.user,
            user_metadata: {
              ...prev.user.user_metadata,
              ...metadata
            }
          } : null
        }));
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  return {
    ...state,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword,
    updateProfile,
    refreshSession: getSession
  };
}
