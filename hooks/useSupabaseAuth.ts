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

// Safety timeout so a hung auth request can't block the entire admin UI forever.
// If Supabase auth doesn't respond within this window, we fall back to
// a \"logged out\" state and let AdminGuard send the user to /admin-login.
const AUTH_INIT_TIMEOUT_MS = 8000;

export function useSupabaseAuth() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  // Fetch profile for user with React Query cache
  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        // Check cache first
        const cachedProfile = queryClient.getQueryData(["profile", userId]) as
          | Profile
          | undefined;
        if (cachedProfile) {
          return cachedProfile;
        }

        const { data: queryData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("auth_id", userId)
          .maybeSingle();

        let data: Profile | null = queryData;

        // If profile doesn't exist, create one
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
            console.error("Error creating profile:", profileRes.error);
            return null;
          }
          data = profileRes.data as Profile;
        }

        if (error) throw error;

        // Cache the profile
        if (data) {
          queryClient.setQueryData(["profile", userId], data);
        }

        return data as Profile | null;
      } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
    },
    [queryClient]
  );

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get current session with a hard timeout so we never hang indefinitely.
        const getSessionWithTimeout = async () => {
          const timeout = new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("AUTH_INIT_TIMEOUT")),
              AUTH_INIT_TIMEOUT_MS,
            ),
          );

          // supabase.auth.getSession() resolves to { data: { session }, error }
          return Promise.race([supabase.auth.getSession(), timeout]) as Promise<{
            data: { session: Session | null };
            error: unknown;
          }>;
        };

        const {
          data: { session },
          error,
        } = await getSessionWithTimeout();

        if (error) throw error;

        if (session?.user && mounted) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            session,
            profile,
            isLoading: false,
            error: null,
          });
        } else if (mounted) {
          setState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Supabase auth init failed:", error);
        if (mounted) {
          setState({
            user: null,
            session: null,
            profile: null,
            isLoading: false,
            error:
              error instanceof Error ? error.message : "Authentication error",
          });
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({
          user: session.user,
          session,
          profile,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          session: null,
          profile: null,
          isLoading: false,
          error: null,
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign in with email/password
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

  // Sign out
  const signOut = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const { error } = await supabase.auth.signOut();

    if (error) {
      setState((prev) => ({ ...prev, isLoading: false, error: error.message }));
      return { error };
    }

    setState({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      error: null,
    });

    return { error: null };
  };

  // Check if user has required role
  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!state.profile) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(state.profile.role);
  };

  // Check if user is admin
  const isAdmin = (): boolean => hasRole("admin");

  // Check if user is mechanic (or admin, since admin has all permissions)
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
