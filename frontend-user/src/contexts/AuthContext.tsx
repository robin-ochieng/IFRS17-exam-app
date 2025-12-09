'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, organisation?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create supabase client inside component with memoization
  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, organisation, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
      }

      return data as Profile;
    } catch (err) {
      console.error('Error in fetchProfile:', err);
      return null;
    }
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      console.log('AuthContext: Starting auth initialization...');
      console.log('AuthContext: Supabase URL configured:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
      
      try {
        console.log('AuthContext: Calling getSession...');
        const startTime = Date.now();
        
        // Create a timeout that resolves with null session instead of rejecting
        let timeoutId: NodeJS.Timeout;
        const timeoutPromise = new Promise<{ data: { session: null }, error: null }>((resolve) => {
          timeoutId = setTimeout(() => {
            console.warn('AuthContext: getSession timed out after 5s, continuing without session');
            resolve({ data: { session: null }, error: null });
          }, 5000);
        });
        
        // Race between actual session fetch and timeout
        const result = await Promise.race([
          supabase.auth.getSession().then(res => {
            clearTimeout(timeoutId);
            return res;
          }),
          timeoutPromise
        ]);
        
        const session = result.data.session;
        const sessionError = result.error;
        
        console.log('AuthContext: getSession completed in', Date.now() - startTime, 'ms, session:', !!session);
        
        if (sessionError) {
          console.error('AuthContext: getSession error:', sessionError);
        }
        
        if (!isMounted) return;
        
        console.log('AuthContext: Session exists:', !!session);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('AuthContext: Fetching profile for user:', session.user.id);
          const profileData = await fetchProfile(session.user.id);
          if (isMounted) setProfile(profileData);
        }
      } catch (error) {
        console.error('AuthContext: Error initializing auth:', error);
        // Don't set auth error for network issues - just proceed without session
        console.log('AuthContext: Proceeding without session due to error');
      } finally {
        console.log('AuthContext: Initialization complete, setting isLoading to false');
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          if (isMounted) setProfile(profileData);
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    // Backup timeout fallback (should rarely trigger since initAuth has its own 5s timeout)
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth initialization backup timeout - forcing loading to complete');
        setIsLoading(false);
      }
    }, 7000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string, organisation?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          organisation: organisation || null,
        },
      },
    });

    if (error) {
      return { error: error as Error };
    }

    // Update the profile with full name and organisation
    if (data.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('profiles') as any)
        .update({
          full_name: fullName,
          organisation: organisation || null,
        })
        .eq('id', data.user.id);
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
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
