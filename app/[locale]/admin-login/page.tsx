'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { supabase } from '@/lib/supabase/client';
import type { InsertProfile, UserRole } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('admin');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      type ProfileRole = { role: UserRole };
      let profile: ProfileRole | null = null;
      let profileError: { code?: string } | null = null;

      const profileRes = await supabase
        .from('profiles')
        .select('role')
        .eq('auth_id', data.user.id)
        .single();
      profile = profileRes.data as ProfileRole | null;
      profileError = profileRes.error;

      if (profileError?.code === 'PGRST116') {
        const insertPayload: InsertProfile = {
          auth_id: data.user.id,
          role: 'mechanic',
          full_name: data.user.email?.split('@')[0] || 'User',
        };
        const createRes = await supabase
          .from('profiles')
          .insert(insertPayload as never)
          .select('role')
          .single();
        if (createRes.error) throw createRes.error;
        profile = createRes.data as ProfileRole | null;
      } else if (profileError) {
        throw profileError;
      }

      if (!profile) throw new Error('Profile not found');

      if (profile.role === 'admin') {
        router.replace(`/${locale}/mb-admin-x77/offers`);
      } else if (profile.role === 'mechanic') {
        router.replace(`/${locale}/mb-admin-mechanics/offers`);
      } else {
        throw new Error('Unauthorized role');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mb-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-mb-anthracite border-mb-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="w-16 h-16 bg-mb-blue rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl text-white">MB Center Admin</CardTitle>
          <CardDescription className="text-mb-silver">
            Sign in to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mbcenter.bg"
                required
                className="bg-gray-100 text-gray-900 border-mb-border placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-gray-100 text-gray-900 border-mb-border placeholder:text-gray-500"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-mb-blue hover:bg-mb-blue/90"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

