import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// The storage key Supabase uses: sb-{hostname}-auth-token
const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;

// ─── Custom lock (process-level, fixes the default processLock deadlock) ──────
let lockTail: Promise<unknown> = Promise.resolve();

async function customLock<R>(
  _name: string,
  acquireTimeout: number,
  fn: () => Promise<R>,
): Promise<R> {
  const waitFor = lockTail;
  let resolveTail!: () => void;
  const tailDone = new Promise<void>((res) => { resolveTail = res; });
  lockTail = tailDone;

  const waitPromise = waitFor.catch(() => null);
  const acquire: Promise<'ok' | 'timeout'> =
    acquireTimeout >= 0
      ? Promise.race([
          waitPromise.then(() => 'ok' as const),
          new Promise<'timeout'>((res) =>
            setTimeout(() => res('timeout'), acquireTimeout),
          ),
        ])
      : waitPromise.then(() => 'ok' as const);

  const result = await acquire;

  if (result === 'timeout') {
    resolveTail();
    const err = new Error(`Acquiring lock timed out after ${acquireTimeout}ms`) as Error & { isAcquireTimeout: boolean };
    err.isAcquireTimeout = true;
    throw err;
  }

  try {
    return await fn();
  } finally {
    resolveTail();
  }
}

// ─── Read token from localStorage without acquiring the lock ──────────────────
//
// Root cause of the inactivity hang:
//   Every PostgREST DB call → fetchWithAuth → auth.getSession() → acquires lock.
//   When the tab becomes visible, _recoverAndRefresh holds the lock while doing a
//   network call to refresh the token. If that call is slow, ALL DB calls queue
//   behind the lock and appear frozen.
//
// Fix: read the token directly from localStorage for DB calls — instant, no lock.
//   The auth client always writes the fresh token to localStorage after every
//   refresh, so this value is always current.
async function getAccessTokenForDB(): Promise<string | null> {
  if (typeof window === 'undefined') return supabaseAnonKey;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return supabaseAnonKey;
    const parsed = JSON.parse(raw);
    return parsed?.access_token ?? supabaseAnonKey;
  } catch {
    return supabaseAnonKey;
  }
}

// ─── Two clients ─────────────────────────────────────────────────────────────
//
// authClient  — used for auth operations only (signIn, signOut, getSession,
//               onAuthStateChange). Handles token refresh with the lock.
//
// supabase    — used for all DB calls (supabase.from(...)). Uses accessToken
//               which reads from localStorage directly, bypassing getSession()
//               and the auth lock entirely. DB calls are never blocked by an
//               ongoing token refresh.

export const authClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    lock: customLock,
  },
});

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    lock: customLock,
    autoRefreshToken: false,
    persistSession: false,
  },
  accessToken: getAccessTokenForDB,
});

export function getSupabaseClient() {
  return supabase;
}
