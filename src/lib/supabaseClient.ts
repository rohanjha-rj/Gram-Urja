import { createClient } from '@supabase/supabase-js';

// These env vars must be set in your .env file (VITE_ prefix for Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
