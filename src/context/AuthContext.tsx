import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabaseClient';

export type UserRole = 'official' | 'citizen' | 'guest';

interface AuthContextValue {
  role: UserRole;
  setRole: (r: UserRole) => void;
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  role: 'guest',
  setRole: () => {},
  session: null,
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

const ROLE_KEY = 'gramurja_role';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(ROLE_KEY) as UserRole | null;
    return saved && ['official', 'citizen', 'guest'].includes(saved) ? saved : 'guest';
  });
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function setRole(r: UserRole) {
    setRoleState(r);
    localStorage.setItem(ROLE_KEY, r);
  }

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) {
      // No credentials — skip all network calls, boot instantly
      setLoading(false);
      return;
    }

    // Get existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    if (!SUPABASE_CONFIGURED) {
      // Offline / Demo Mode: Allow demo login or any valid email
      const mockUser: User = {
        id: 'demo-household-user-001',
        app_metadata: {},
        user_metadata: { name: 'Demo Household Resident', email },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: email || 'demo@gramurja.in',
      } as unknown as User;
      const mockSession: Session = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'bearer',
        user: mockUser,
      };
      setSession(mockSession);
      setUser(mockUser);
      setRoleState('citizen');
      localStorage.setItem(ROLE_KEY, 'citizen');
      return { error: null };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data?.session) {
      setSession(data.session);
      setUser(data.session.user);
    }
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string) {
    if (!SUPABASE_CONFIGURED) {
      // Offline / Demo Mode: Simulate successful signup
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    if (SUPABASE_CONFIGURED) await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRoleState('guest');
    localStorage.setItem(ROLE_KEY, 'guest');
  }

  return (
    <AuthContext.Provider value={{ role, setRole, session, user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
