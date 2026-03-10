import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// The default navigator.locks-based lock throws AbortError on page refresh in
// production builds, causing getSession() to fail and the admin panel to show
// a blank page until the user refreshes several times. Since this app doesn't
// require multi-tab session coordination (admin panel is typically single-tab),
// we use a simple process-level lock that never touches navigator.locks.
async function simpleLock<R>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>,
): Promise<R> {
  return fn();
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    lock: simpleLock,
  },
});

export function getSupabaseClient() {
  return supabase;
}
