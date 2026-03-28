import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { HourlyActivity } from "@/types/database";

const QUERY_KEY = ["hourly_activities"];

export function useHourlyActivities() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<HourlyActivity[]> => {
      const { data, error } = await supabase
        .from("hourly_activities")
        .select("*")
        .order("sort_order")
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as HourlyActivity[];
    },
    staleTime: 5_000,
    refetchOnWindowFocus: true,
  });
}

export function useAddHourlyActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; pricePerHourEur: number }) => {
      const { data, error } = await supabase
        .from("hourly_activities")
        .insert({ name: input.name, price_per_hour_eur: input.pricePerHourEur } as never)
        .select()
        .single();
      if (error) throw error;
      return data as HourlyActivity;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateHourlyActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; name: string; pricePerHourEur: number }) => {
      const { error } = await supabase
        .from("hourly_activities")
        .update({ name: input.name, price_per_hour_eur: input.pricePerHourEur } as never)
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteHourlyActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("hourly_activities")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
