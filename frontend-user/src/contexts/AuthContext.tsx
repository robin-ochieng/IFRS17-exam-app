'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, organisation?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create client ONCE outside the component - this is important!
const supabase = createClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Prevent double initialization in React strict mode
  const initAttempted = useRef(false);
  // Cache profiles to reduce database calls
  const profileCache = useRef<Map<string, { profile: Profile; timestamp: number }>>(new Map());

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    // Check cache first (valid for 5 minutes)
    const cached = profileCache.current.get(userId);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      console.log('AuthContext: Using cached profile');
      return cached.profile;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, organisation, role')
        .eq('id', userId)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('AuthContext: Error fetching profile:', error.message);
        return null;
      }

      if (!data) {
        console.log('AuthContext: No profile found for user:', userId);
        return null;
      }

      const profileData = data as Profile;
      profileCache.current.set(userId, { profile: profileData, timestamp: Date.now() });
      return profileData;
    } catch (err) {
      console.error('AuthContext: Error in fetchProfile:', err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      profileCache.current.delete(user.id);
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user, fetchProfile]);

  // Handle auth state changes - this is the KEY fix!
  // onAuthStateChange fires IMMEDIATELY with INITIAL_SESSION from localStorage
  // No network call required, so no timeout issues!
  const handleAuthChange = useCallback(async (event: AuthChangeEvent, newSession: Session | null) => {
    console.log('AuthContext: Auth event:', event, 'Session:', !!newSession);
    
    setSession(newSession);
    setUser(newSession?.user ?? null);

    if (newSession?.user) {
      const profileData = await fetchProfile(newSession.user.id);
      setProfile(profileData);
    } else {
      setProfile(null);
    }

    setIsLoading(false);
    setIsInitialized(true);
  }, [fetchProfile]);

  useEffect(() => {
    // Prevent double initialization
    if (initAttempted.current) return;
    initAttempted.current = true;

    console.log('AuthContext: Setting up auth listener...');

    // THE KEY CHANGE: Just set up the listener!
    // Supabase will fire INITIAL_SESSION event immediately when it reads from localStorage
    // This is instant - no network call, no timeout needed!
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Safety fallback: If somehow no auth event fires within 5 seconds, assume no session
    // This should rarely/never happen, but prevents infinite loading
    const fallbackTimer = setTimeout(() => {
      if (!isInitialized) {
        console.log('AuthContext: Fallback triggered - no auth event received');
        setIsLoading(false);
        setIsInitialized(true);
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimer);
    };
  }, [handleAuthChange, isInitialized]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setIsLoading(false);
        return { error: error as Error };
      }
      
      // Directly update state after successful login
      // Don't rely on onAuthStateChange which may not fire reliably
      if (data.session) {
        console.log('AuthContext: Sign in successful, updating state directly');
        setSession(data.session);
        setUser(data.session.user);
        
        // Fetch profile
        const profileData = await fetchProfile(data.session.user.id);
        setProfile(profileData);
      }
      
      setIsLoading(false);
      return { error: null };
    } catch (err) {
      setIsLoading(false);
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, organisation?: string) => {
    try {
      setIsLoading(true);
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
        setIsLoading(false);
        return { error: error as Error };
      }

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
    } catch (err) {
      setIsLoading(false);
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      profileCache.current.clear();
    } catch (error) {
      console.error('AuthContext: Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isInitialized,
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
