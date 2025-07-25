import { useEffect, useState, useRef } from 'react';
import { supabase, Profile, isSupabaseConfigured } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Set mounted to true immediately when effect runs
    mountedRef.current = true;
    
    const initializeAuth = async () => {
      try {
        // If Supabase is not configured, set loading to false immediately
        if (!isSupabaseConfigured) {
          if (mountedRef.current) {
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        // Small delay to ensure component is fully mounted
        await new Promise(resolve => setTimeout(resolve, 10));
        
        if (!mountedRef.current) return;

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mountedRef.current) {
          if (error) {
            console.error('Error getting session:', error);
          }
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setLoading(false);
            setInitialized(true);
          }
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mountedRef.current) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mountedRef.current && loading) {
        console.warn('Auth initialization timeout, proceeding without auth');
        setLoading(false);
        setInitialized(true);
      }
    }, 3000);

    initializeAuth();

    // Listen for auth changes only if Supabase is configured
    let subscription: any = null;
    
    if (isSupabaseConfigured) {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        // Ensure component is still mounted before state updates
        if (mountedRef.current) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
            if (mountedRef.current) {
              setLoading(false);
              setInitialized(true);
            }
          }
        }
      });
      
      subscription = authSubscription;
    }

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array is correct here

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured || !mountedRef.current) {
      if (mountedRef.current) {
        setLoading(false);
        setInitialized(true);
      }
      return;
    }
    
    try {
      // Double-check mount status before making request
      if (!mountedRef.current) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (mountedRef.current) {
        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
        setLoading(false);
        setInitialized(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (mountedRef.current) {
        setLoading(false);
        setInitialized(true);
      }
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase is not configured. Please set up your environment variables.') };
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      // Handle user_already_exists specifically to prevent console logging
      if (error && error.message === 'User already registered') {
        return { data, error: null, status: 'user_already_exists' };
      }
      
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase is not configured. Please set up your environment variables.') };
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase is not configured. Please set up your environment variables.') };
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user') };
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Supabase is not configured. Please set up your environment variables.') };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (!error && data && mountedRef.current) {
        setProfile(data);
      }

      return { data, error };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  return {
    session,
    user,
    profile,
    loading,
    initialized,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
}