"use client";

import { useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
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
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    error: null,
  });

  // Fetch profile for user
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_id", userId)
        .single();

      // If profile doesn't exist, create one (fallback if trigger didn't run)
      if (error && error.code === "PGRST116") {
        const insertPayload: InsertProfile = {
          auth_id: userId,
          role: "mechanic", // Default role
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
        return profileRes.data as Profile;
      }

      if (error) throw error;
      return data as Profile | null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Get current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

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
