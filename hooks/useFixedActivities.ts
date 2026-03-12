import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { FixedActivity } from "@/types/database";

const QUERY_KEY = ["fixed_activities"];

export function useFixedActivities() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<FixedActivity[]> => {
      const { data, error } = await supabase
        .from("fixed_activities")
        .select("*")
        .order("sort_order")
        .order("created_at");

      if (error) throw error;
      return (data ?? []) as FixedActivity[];
    },
    staleTime: 5_000,
    refetchOnWindowFocus: true,
  });
}

export function useAddFixedActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; priceEur: number }) => {
      const { data, error } = await supabase
        .from("fixed_activities")
        .insert({ name: input.name, price_eur: input.priceEur } as never)
        .select()
        .single();
      if (error) throw error;
      return data as FixedActivity;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateFixedActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      name: string;
      priceEur: number;
    }) => {
      const { error } = await supabase
        .from("fixed_activities")
        .update({ name: input.name, price_eur: input.priceEur } as never)
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteFixedActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("fixed_activities")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
