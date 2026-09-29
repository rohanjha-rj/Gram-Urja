import { createClient } from '@supabase/supabase-js';

// These env vars must be set in your .env file (VITE_ prefix for Vite).
// If they are missing the app still boots in local/demo mode.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseAnonKey);

// Use placeholder values when not configured so createClient doesn't throw.
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
);
