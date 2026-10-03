import { createClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://dfihlbbnwjmozkkdwago.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_Pnq4IGoKLv6mCtstFR7GGA_tVGWxvJ0';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL).trim();
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY).trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
