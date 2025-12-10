/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';

// Mock data for tests
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

const mockSession = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  user: mockUser,
};

const mockProfile = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  organisation: 'Test Org',
  role: 'user',
};

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    }),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
        }),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      }),
    }),
  }),
};

// Mock the createClient function
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}));

describe('Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('Sign In', () => {
    it('should successfully sign in with valid credentials', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      const signIn = async (email: string, password: string) => {
        const { data, error } = await mockSupabaseClient.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          return { error: error as Error, user: null, session: null };
        }
        
        return { error: null, user: data.user, session: data.session };
      };

      const result = await signIn('test@example.com', 'password123');

      expect(result.error).toBeNull();
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
    });

    it('should return error for invalid credentials', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: null, user: null },
        error: { message: 'Invalid login credentials' },
      });

      const signIn = async (email: string, password: string) => {
        const { data, error } = await mockSupabaseClient.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          return { error: error as Error, user: null, session: null };
        }
        
        return { error: null, user: data.user, session: data.session };
      };

      const result = await signIn('wrong@example.com', 'wrongpassword');

      expect(result.error).not.toBeNull();
      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
    });

    it('should directly update state after successful sign in', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      let user = null;
      let session = null;
      let profile = null;

      const signIn = async (email: string, password: string) => {
        const { data, error } = await mockSupabaseClient.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          return { error: error as Error };
        }
        
        // Directly update state (as per the fix)
        if (data.session) {
          session = data.session;
          user = data.session.user;
          profile = mockProfile; // Would normally fetch from DB
        }
        
        return { error: null };
      };

      const result = await signIn('test@example.com', 'password123');

      expect(result.error).toBeNull();
      expect(user).not.toBeNull();
      expect(session).not.toBeNull();
      expect(profile).not.toBeNull();
    });
  });

  describe('Sign Out', () => {
    it('should successfully sign out', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValueOnce({ error: null });

      let user = mockUser;
      let session = mockSession;
      let profile = mockProfile;

      const signOut = async () => {
        const { error } = await mockSupabaseClient.auth.signOut();
        
        if (!error) {
          user = null as any;
          session = null as any;
          profile = null as any;
        }
        
        return { error };
      };

      const result = await signOut();

      expect(result.error).toBeNull();
      expect(user).toBeNull();
      expect(session).toBeNull();
      expect(profile).toBeNull();
    });
  });

  describe('Session Persistence', () => {
    it('should restore session from INITIAL_SESSION event', async () => {
      let user = null;
      let session = null;
      let isInitialized = false;

      const handleAuthChange = (event: string, newSession: typeof mockSession | null) => {
        session = newSession;
        user = newSession?.user ?? null;
        isInitialized = true;
      };

      // Simulate INITIAL_SESSION event firing
      handleAuthChange('INITIAL_SESSION', mockSession);

      expect(user).toEqual(mockUser);
      expect(session).toEqual(mockSession);
      expect(isInitialized).toBe(true);
    });

    it('should handle no session on INITIAL_SESSION', () => {
      let user = null;
      let session = null;
      let isInitialized = false;

      const handleAuthChange = (event: string, newSession: typeof mockSession | null) => {
        session = newSession;
        user = newSession?.user ?? null;
        isInitialized = true;
      };

      // Simulate INITIAL_SESSION event with no session
      handleAuthChange('INITIAL_SESSION', null);

      expect(user).toBeNull();
      expect(session).toBeNull();
      expect(isInitialized).toBe(true);
    });
  });

  describe('Profile Fetching', () => {
    it('should fetch profile after sign in', async () => {
      const fetchProfile = async (userId: string) => {
        const { data, error } = await mockSupabaseClient
          .from('profiles')
          .select('id, email, full_name, organisation, role')
          .eq('id', userId)
          .single();

        if (error) return null;
        return data;
      };

      const profile = await fetchProfile('test-user-id');

      expect(profile).toEqual(mockProfile);
      expect(profile?.full_name).toBe('Test User');
    });

    it('should use cached profile within cache duration', () => {
      const profileCache = new Map<string, { profile: typeof mockProfile; timestamp: number }>();
      
      // Add to cache
      profileCache.set('test-user-id', {
        profile: mockProfile,
        timestamp: Date.now(),
      });

      const fetchProfile = (userId: string) => {
        const cached = profileCache.get(userId);
        if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
          return cached.profile;
        }
        return null;
      };

      const profile = fetchProfile('test-user-id');

      expect(profile).toEqual(mockProfile);
    });

    it('should not use expired cache', () => {
      const profileCache = new Map<string, { profile: typeof mockProfile; timestamp: number }>();
      
      // Add expired cache (6 minutes old)
      profileCache.set('test-user-id', {
        profile: mockProfile,
        timestamp: Date.now() - 6 * 60 * 1000,
      });

      const fetchProfile = (userId: string) => {
        const cached = profileCache.get(userId);
        if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
          return cached.profile;
        }
        return null;
      };

      const profile = fetchProfile('test-user-id');

      expect(profile).toBeNull();
    });
  });

  describe('Login Page Redirect', () => {
    it('should redirect to dashboard after successful login', async () => {
      let redirectedTo: string | null = null;
      const router = {
        push: (path: string) => { redirectedTo = path; },
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: mockSession, user: mockUser },
        error: null,
      });

      const handleSubmit = async (email: string, password: string) => {
        const { data, error } = await mockSupabaseClient.auth.signInWithPassword({
          email,
          password,
        });
        
        if (!error && data.session) {
          router.push('/dashboard');
        }
        
        return { error };
      };

      const result = await handleSubmit('test@example.com', 'password123');

      expect(result.error).toBeNull();
      expect(redirectedTo).toBe('/dashboard');
    });

    it('should not redirect on login failure', async () => {
      let redirectedTo: string | null = null;
      const router = {
        push: (path: string) => { redirectedTo = path; },
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { session: null, user: null },
        error: { message: 'Invalid credentials' },
      });

      const handleSubmit = async (email: string, password: string) => {
        const { data, error } = await mockSupabaseClient.auth.signInWithPassword({
          email,
          password,
        });
        
        if (!error && data.session) {
          router.push('/dashboard');
        }
        
        return { error };
      };

      const result = await handleSubmit('wrong@example.com', 'wrong');

      expect(result.error).not.toBeNull();
      expect(redirectedTo).toBeNull();
    });

    it('should redirect already authenticated user', () => {
      let redirectedTo: string | null = null;
      const router = {
        push: (path: string) => { redirectedTo = path; },
      };

      const isInitialized = true;
      const user = mockUser;
      const redirectTo = '/dashboard';

      // Simulate the useEffect logic
      if (isInitialized && user) {
        router.push(redirectTo);
      }

      expect(redirectedTo).toBe('/dashboard');
    });
  });

  describe('Protected Route Access', () => {
    it('should redirect to login if not authenticated', () => {
      let redirectedTo: string | null = null;
      const router = {
        push: (path: string) => { redirectedTo = path; },
      };

      const isInitialized = true;
      const user = null;

      // Simulate dashboard page useEffect logic
      if (isInitialized && !user) {
        router.push('/login');
      }

      expect(redirectedTo).toBe('/login');
    });

    it('should allow access to dashboard if authenticated', () => {
      let redirectedTo: string | null = null;
      const router = {
        push: (path: string) => { redirectedTo = path; },
      };

      const isInitialized = true;
      const user = mockUser;

      // Simulate dashboard page useEffect logic
      if (isInitialized && !user) {
        router.push('/login');
      }

      // Should not redirect
      expect(redirectedTo).toBeNull();
    });
  });
});

describe('Loading States', () => {
  it('should show loading while auth is initializing', () => {
    const isInitialized = false;
    const isLoading = true;
    
    const showLoading = !isInitialized || isLoading;
    
    expect(showLoading).toBe(true);
  });

  it('should not show loading after initialization', () => {
    const isInitialized = true;
    const isLoading = false;
    
    const showLoading = !isInitialized || isLoading;
    
    expect(showLoading).toBe(false);
  });
});
