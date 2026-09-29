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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('guest');
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      return { error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.' };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(email: string, password: string) {
    if (!SUPABASE_CONFIGURED) {
      return { error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.' };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    if (SUPABASE_CONFIGURED) await supabase.auth.signOut();
    setRole('guest');
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
