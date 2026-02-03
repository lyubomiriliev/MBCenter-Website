'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { Profile, InsertProfile } from '@/types/database';

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;

      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_id', userId)
        .single();

      // If profile doesn't exist, create one
      if (error && error.code === 'PGRST116') {
        const insertPayload: InsertProfile = {
          auth_id: userId,
          role: 'mechanic',
          full_name: null,
        };

        const profileRes = await supabase
          .from('profiles')
          .insert(insertPayload as never)
          .select('*')
          .single();

        if (profileRes.error) {
          console.error('Error creating profile:', profileRes.error);
          return null;
        }
        return profileRes.data as Profile;
      }

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
