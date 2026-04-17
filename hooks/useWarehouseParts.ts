"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { WarehousePart, WarehousePartInsert, WarehousePartUpdate } from "@/types/database";
import * as XLSX from "xlsx";

interface WarehouseFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}

export function useWarehouseParts(filters: WarehouseFilters = {}) {
  const { search = "", page = 1, pageSize = 50 } = filters;

  return useQuery({
    queryKey: ["warehouse_parts", { search, page, pageSize }],
    queryFn: async () => {
      let query = supabase
        .from("warehouse_parts")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (search.trim()) {
        const term = search.trim();
        query = query.or(
          `name.ilike.%${term}%,part_number.ilike.%${term}%,replaced_by.ilike.%${term}%`
        );
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        parts: data as WarehousePart[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
    refetchOnWindowFocus: false,
  });
}

export function useCreateWarehousePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WarehousePartInsert) => {
      const { data: result, error } = await supabase
        .from("warehouse_parts")
        .insert(data as never)
        .select()
        .single();

      if (error) throw error;
      return result as WarehousePart;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse_parts"] });
    },
  });
}

export function useUpdateWarehousePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & WarehousePartUpdate) => {
      const { data: result, error } = await supabase
        .from("warehouse_parts")
        .update(data as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result as WarehousePart;
    },
    onSuccess: (updated) => {
      // Patch the part in-place in every cached page so the list order stays stable.
      queryClient.setQueriesData<{ parts: WarehousePart[]; totalCount: number; totalPages: number }>(
        { queryKey: ["warehouse_parts"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            parts: old.parts.map((p) => (p.id === updated.id ? updated : p)),
          };
        },
      );
    },
  });
}

export function useDeleteWarehousePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("warehouse_parts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse_parts"] });
    },
  });
}

export function useUpsertWarehouseParts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rows: WarehousePartInsert[]) => {
      const { data, error } = await supabase
        .from("warehouse_parts")
        .upsert(rows as never, { onConflict: "part_number" })
        .select();

      if (error) throw error;
      return data as WarehousePart[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouse_parts"] });
    },
  });
}

export function downloadWarehouseTemplate() {
  const headers = [
    {
      Name: "",
      "Part Number": "",
      Manufacturer: "MERCEDES",
      Quantity: 0,
      "Cost Price (EUR)": 0,
      "Sale Price (EUR)": 0,
      "Replaced By": "",
    },
  ];

  const ws = XLSX.utils.json_to_sheet(headers);
  // Remove the single example row — keep only the header row
  ws["!ref"] = "A1:G1";

  // Set column widths
  ws["!cols"] = [
    { wch: 30 }, // Name
    { wch: 20 }, // Part Number
    { wch: 15 }, // Manufacturer
    { wch: 10 }, // Quantity
    { wch: 18 }, // Cost Price
    { wch: 18 }, // Sale Price
    { wch: 20 }, // Replaced By
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Warehouse");
  XLSX.writeFile(wb, "warehouse_import_template.xlsx");
}

export async function exportWarehouseToXlsx(parts: WarehousePart[]) {
  const rows = parts.map((p) => ({
    Name: p.name,
    "Part Number": p.part_number,
    Manufacturer: p.manufacturer,
    Quantity: p.quantity,
    "Cost Price (EUR)": p.cost_price,
    "Sale Price (EUR)": p.sale_price,
    "Replaced By": p.replaced_by ?? "",
    "Created At": new Date(p.created_at).toLocaleDateString("bg-BG"),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Warehouse");

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `warehouse_backup_${today}.xlsx`);
}
