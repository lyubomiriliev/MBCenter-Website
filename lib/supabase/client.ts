import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Token refresh requests (/auth/v1/token?grant_type=refresh_token) can hang
// indefinitely if the Supabase project is slow to respond (e.g. cold start,
// network issues). We cap them at 8 s so that getSession() never blocks the UI
// forever. Login requests (grant_type=password) get a 15 s limit instead.
const supabaseFetch: typeof fetch = (input, init) => {
  const url = typeof input === 'string' ? input : (input as Request).url;

  if (url.includes('/auth/v1/token')) {
    const isPasswordGrant = url.includes('grant_type=password') ||
      (init?.body && String(init.body).includes('grant_type=password'));

    const timeoutMs = isPasswordGrant ? 15_000 : 8_000;
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), timeoutMs);

    const mergedInit: RequestInit = {
      ...init,
      signal: controller.signal,
    };

    return fetch(input, mergedInit).finally(() => clearTimeout(timerId));
  }

  return fetch(input, init);
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  global: { fetch: supabaseFetch },
});

export function getSupabaseClient() {
  return supabase;
}
