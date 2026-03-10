"use client";

import { useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Profile, UserRole, InsertProfile } from "@/types/database";

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
}

// Read the raw session object Supabase persists in localStorage.
// This is synchronous and never makes a network request, so it never hangs.
// Used as a fast fallback when getSession() is slow (token refresh in flight).
function readStoredSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const projectRef = new URL(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
    ).hostname.split(".")[0];
    const raw = localStorage.getItem(`sb-${projectRef}-auth-token`);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<Session> & {
      expires_at?: number;
    };
    if (!stored.access_token || !stored.user) return null;
    const now = Math.floor(Date.now() / 1000);
    return {
      access_token: stored.access_token,
      refresh_token: stored.refresh_token ?? "",
      expires_in: Math.max(0, (stored.expires_at ?? 0) - now),
      expires_at: stored.expires_at,
      token_type: stored.token_type ?? "bearer",
      user: stored.user as User,
    } as Session;
  } catch {
    return null;
  }
}

export function useSupabaseAuth() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        const cachedProfile = queryClient.getQueryData(["profile", userId]) as
          | Profile
          | undefined;
        if (cachedProfile) return cachedProfile;

        const { data: queryData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("auth_id", userId)
          .maybeSingle();

        let data: Profile | null = queryData;

        if (!data) {
          const insertPayload: InsertProfile = {
            auth_id: userId,
            role: "mechanic",
            full_name: null,
          };

          const profileRes = await supabase
            .from("profiles")
            .insert(insertPayload as never)
            .select("*")
            .single();

          if (profileRes.error) {
            console.error("[auth] Error creating profile:", profileRes.error);
            return null;
          }
          data = profileRes.data as Profile;
        }

        if (error) throw error;

        if (data) queryClient.setQueryData(["profile", userId], data);

        return data as Profile | null;
      } catch (error) {
        console.error("[auth] Error fetching profile:", error);
        return null;
      }
    },
    [queryClient],
  );

  useEffect(() => {
    let mounted = true;
    let resolved = false;

    const applySession = async (session: Session | null, source: string) => {
      if (!mounted || resolved) return;
      resolved = true;

      console.log(`[auth] applySession(${source}):`, !!session);

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        console.log("[auth] profile:", !!profile, profile?.role);
        if (mounted) {
          setState({
            user: session.user,
            session,
            profile,
            isLoading: false,
            error: null,
          });
        }
      } else {
        setState({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          error: null,
        });
      }
    };

    // Register listener first so we never miss SIGNED_IN / TOKEN_REFRESHED.
    // INITIAL_SESSION with null is intentionally skipped here — getSession()
    // is the more reliable source for the initial check.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      console.log("[auth] onAuthStateChange:", event, !!session);

      if (session) {
        await applySession(session, `onAuthStateChange:${event}`);
      } else if (event === "SIGNED_OUT") {
        resolved = true;
        if (mounted) {
          setState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            error: null,
          });
        }
      }
    });

    // Primary: getSession() — reads from localStorage, and if the token is
    // expired triggers a refresh network request. With the 8 s timeout we
    // added to lib/supabase/client.ts, this will no longer hang forever.
    (async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted || resolved) return;

        console.log("[auth] getSession:", !!session, error?.message);

        if (error) {
          if (
            error.name === "AuthSessionMissingError" ||
            (error as { status?: number }).status === 401
          ) {
            await applySession(null, "getSession:authError");
          } else {
            console.error("[auth] getSession non-auth error:", error);
            // Fall through to localStorage fallback below
          }
          return;
        }

        await applySession(session, "getSession");
      } catch (err) {
        if (!mounted || resolved) return;

        // AbortError = our 8 s timeout fired (token refresh was hanging).
        // Fall back to reading the raw stored session from localStorage so
        // the page can load immediately rather than waiting 8+ seconds for
        // the safety timer.
        console.error("[auth] getSession threw — trying localStorage fallback:", err);

        const stored = readStoredSession();
        console.log("[auth] localStorage fallback:", !!stored, stored?.user?.id);

        if (stored?.user) {
          // Use the stored session. The access token may be expired, but
          // onAuthStateChange will fire TOKEN_REFRESHED once Supabase
          // finishes the refresh in the background, updating state then.
          await applySession(stored, "localStorage-fallback");
        } else {
          // No stored session at all — definitely not logged in.
          await applySession(null, "localStorage-fallback:empty");
        }
      }
    })();

    // Last-resort: if nothing resolved in 12 s, unblock isLoading so
    // AdminGuard can redirect rather than showing a skeleton forever.
    const safetyTimer = setTimeout(() => {
      if (mounted && !resolved) {
        console.error("[auth] Init timed out after 12 s");
        setState((prev) =>
          prev.isLoading ? { ...prev, isLoading: false } : prev,
        );
      }
    }, 12_000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setState((prev) => ({ ...prev, isLoading: false, error: error.message }));
      return { error };
    }

    return { data };
  };

  const signOut = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const { error } = await supabase.auth.signOut();

    if (error) {
      setState((prev) => ({ ...prev, isLoading: false, error: error.message }));
      return { error };
    }

    return { error: null };
  };

  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!state.profile) return false;
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(state.profile.role);
  };

  const isAdmin = (): boolean => hasRole("admin");
  const isMechanic = (): boolean => hasRole(["mechanic", "admin"]);

  return {
    ...state,
    signIn,
    signOut,
    hasRole,
    isAdmin,
    isMechanic,
    isAuthenticated: !!state.user && !!state.profile,
  };
}
