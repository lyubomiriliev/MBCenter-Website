"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TurnoverPage } from "@/components/admin/turnover/TurnoverPage";
import { useSupabaseAuthContext } from "@/components/admin/SupabaseAuthContext";
import { canSeeBetaSections } from "@/lib/feature-flags";

export default function TurnoverRoute() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "bg";
  const { user, isLoading } = useSupabaseAuthContext();

  // Temporary: the section is in testing, so anyone else who reaches this URL
  // directly is sent back to the offers list. See lib/feature-flags.ts.
  const allowed = canSeeBetaSections(user?.email);

  useEffect(() => {
    if (!isLoading && !allowed) {
      router.replace(`/${locale}/mb-admin/offers`);
    }
  }, [isLoading, allowed, router, locale]);

  if (isLoading || !allowed) return null;

  return <TurnoverPage />;
}
