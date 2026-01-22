import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single supabase client for client-side usage
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper to get typed client
export function getSupabaseClient() {
  return supabase;
}



