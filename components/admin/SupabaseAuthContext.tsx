"use client";

import React, { createContext, useContext } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

type SupabaseAuthContextValue = ReturnType<typeof useSupabaseAuth>;

const SupabaseAuthContext = createContext<SupabaseAuthContextValue | null>(null);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useSupabaseAuth();
  return (
    <SupabaseAuthContext.Provider value={auth}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuthContext(): SupabaseAuthContextValue {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx) throw new Error("useSupabaseAuthContext must be used inside SupabaseAuthProvider");
  return ctx;
}
