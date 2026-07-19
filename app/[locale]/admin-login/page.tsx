"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { authClient, supabase } from "@/lib/supabase/client";
import type { InsertProfile, UserRole } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("admin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } =
        await authClient.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) throw authError;
      if (!authData?.user) throw new Error("AUTH_FAILED");

      // Fetch user profile with role (minimal fields for faster response)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("auth_id", authData.user.id)
        .maybeSingle();

      // If profile doesn't exist, create default profile
      if (!profile) {
        const insertPayload: InsertProfile = {
          auth_id: authData.user.id,
          role: "mechanic",
          full_name: authData.user.email?.split("@")[0] || "User",
        };

        await supabase.from("profiles").insert(insertPayload as never);

        // Redirect new mechanic user (don't wait for confirmation)
        router.replace(`/${locale}/mb-admin-mechanics/offers`);
        return;
      }

      if (profileError) throw profileError;

      type ProfileRole = { role: UserRole };
      const userRole = (profile as ProfileRole).role;

      // Redirect based on role (keep loading state for smooth transition)
      const targetRoute =
        userRole === "admin" || userRole === "reception"
          ? `/${locale}/mb-admin/offers`
          : `/${locale}/mb-admin-mechanics/offers`;

      router.replace(targetRoute);
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err instanceof Error && err.message === "AUTH_FAILED"
          ? t("login.errorAuthFailed")
          : err instanceof Error
            ? err.message
            : t("login.errorDefault");
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-mb-black flex flex-col items-center justify-center p-4 gap-6">
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
        <Image
          src="/assets/images/mb-pattern.webp"
          alt=""
          fill
          className="object-cover opacity-15 pointer-events-none"
          priority
          sizes="100vw"
        />
      </div>
      <Card className="relative z-10 w-full max-w-[420px] bg-mb-anthracite/95 border-mb-border rounded-2xl shadow-xl shadow-black/40 overflow-hidden">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="relative mx-auto mb-5 w-60 h-14">
            <Image
              src="/assets/logos/mbc-logo-white.png"
              alt="MB Center"
              fill
              className="object-contain object-center"
              priority
              unoptimized
              sizes="240px"
            />
          </div>

          <CardDescription className="text-mb-silver text-sm mt-1.5">
            {t("login.signInSubtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2 pb-8 px-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-mb-silver">
                {t("login.email")}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                required
                className="bg-gray-100 text-gray-900 border-mb-border placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-mb-silver">
                {t("login.password")}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                required
                className="bg-gray-100 text-gray-900 border-mb-border placeholder:text-gray-500"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-mb-blue hover:bg-mb-blue/90 h-11 rounded-lg font-medium"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t("login.signingIn")}
                </>
              ) : (
                t("login.signIn")
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Link
        href={locale ? `/${locale}` : "/"}
        className="relative z-10 text-sm text-mb-silver hover:text-white transition-colors flex items-center gap-2"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        {t("sidebar.backToSite")}
      </Link>
    </div>
  );
}
