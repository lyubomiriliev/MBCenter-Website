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
            console.error("Error creating profile:", profileRes.error);
            return null;
          }
          data = profileRes.data as Profile;
        }

        if (error) throw error;

        if (data) queryClient.setQueryData(["profile", userId], data);

        return data as Profile | null;
      } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
    },
    [queryClient],
  );

  useEffect(() => {
    let mounted = true;
    let initialized = false;

    // onAuthStateChange is the single source of truth for auth state in
    // Supabase JS v2. It fires INITIAL_SESSION on mount with the stored
    // session (or null), so we no longer need a separate getSession() call
    // that races with this and can cause AbortErrors in production.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      initialized = true;

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
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
    });

    // Safety net: if INITIAL_SESSION never fires within 8 s (e.g. network
    // completely unreachable), unblock the UI so AdminGuard can redirect to
    // login rather than showing a skeleton forever.
    // Importantly we do NOT set user: null here — that would create a false
    // "logged-out" state; we just clear isLoading and let AdminGuard decide.
    const safetyTimer = setTimeout(() => {
      if (mounted && !initialized) {
        console.error("Auth: INITIAL_SESSION not received within 8 s");
        setState((prev) =>
          prev.isLoading ? { ...prev, isLoading: false } : prev,
        );
      }
    }, 8000);

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

    // isLoading will be cleared by the SIGNED_IN event from onAuthStateChange
    return { data };
  };

  const signOut = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const { error } = await supabase.auth.signOut();

    if (error) {
      setState((prev) => ({ ...prev, isLoading: false, error: error.message }));
      return { error };
    }

    // SIGNED_OUT event will clear the state via onAuthStateChange
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
