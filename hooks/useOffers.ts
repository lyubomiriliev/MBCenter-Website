"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type {
  Offer,
  OfferWithRelations,
  InsertOffer,
  UpdateOffer,
  OfferStatus,
  InsertOfferItem,
  OfferItem,
} from "@/types/database";

const CYRILLIC_TO_LATIN: Record<string, string> = {
  А: "A",
  В: "B",
  Е: "E",
  К: "K",
  М: "M",
  Н: "N",
  О: "O",
  Р: "P",
  С: "C",
  Т: "T",
  У: "Y",
  Х: "X",
  а: "a",
  в: "b",
  е: "e",
  к: "k",
  м: "m",
  н: "n",
  о: "o",
  р: "p",
  с: "c",
  т: "t",
  у: "y",
  х: "x",
};
const LATIN_TO_CYRILLIC: Record<string, string> = Object.fromEntries(
  Object.entries(CYRILLIC_TO_LATIN).map(([k, v]) => [v.toUpperCase(), k])
);

export function getSearchVariants(term: string): string[] {
  const variants = new Set<string>([term]);
  const toLatin = term.replace(/./g, (c) => CYRILLIC_TO_LATIN[c] ?? c);
  if (toLatin !== term) variants.add(toLatin);
  const toCyrillic = term.replace(
    /./g,
    (c) => LATIN_TO_CYRILLIC[c.toUpperCase()] ?? c
  );
  if (toCyrillic !== term) variants.add(toCyrillic);
  return Array.from(variants);
}

interface OffersFilters {
  status?: OfferStatus | "all";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

// Fetch offers with filters
export function useOffers(filters: OffersFilters = {}) {
  const {
    status = "all",
    search = "",
    dateFrom,
    dateTo,
    page = 1,
    pageSize = 20,
  } = filters;

  return useQuery({
    queryKey: ["offers", { status, search, dateFrom, dateTo, page, pageSize }],
    queryFn: async () => {
      let query = supabase
        .from("offers")
        .select(
          `
          id,
          offer_number,
          customer_name,
          customer_phone,
          customer_email,
          car_model_text,
          car_model_detail,
          repair_name,
          license_plate,
          vin_text,
          status,
          total_gross,
          created_at,
          service_card_number,
          service_card_generated_at,
          client:clients(id, name),
          car:cars(id, model, year, license_plate, vin)
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      // Apply filters
      if (status !== "all") {
        query = query.eq("status", status);
      }

      if (search) {
        const term = search.trim();
        const variants = getSearchVariants(term);
        const baseConditions = [
          `offer_number.ilike.%${term}%`,
          `customer_name.ilike.%${term}%`,
          `customer_phone.ilike.%${term}%`,
          `repair_name.ilike.%${term}%`,
          `car_model_text.ilike.%${term}%`,
          `car_model_detail.ilike.%${term}%`,
        ];
        const vinLicenseConditions = variants.flatMap((v) => [
          `vin_text.ilike.%${v}%`,
          `license_plate.ilike.%${v}%`,
        ]);
        query = query.or(
          [...baseConditions, ...vinLicenseConditions].join(",")
        );
      }

      if (dateFrom) {
        query = query.gte("created_at", dateFrom);
      }

      if (dateTo) {
        query = query.lte("created_at", dateTo);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        offers: data as OfferWithRelations[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds (increased from 10s)
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (increased from 5min)
    refetchOnWindowFocus: false,
  });
}

// Fetch single offer
export function useOffer(id: string | undefined) {
  return useQuery({
    queryKey: ["offer", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("offers")
        .select(
          `
          id,
          offer_number,
          customer_name,
          customer_phone,
          customer_email,
          client_id,
          car_model_text,
          car_model_detail,
          repair_name,
          car_year,
          vin_text,
          license_plate,
          mileage,
          car_id,
          created_by_name,
          discount_percent,
          discount_parts_percent,
          discount_services_percent,
          notes,
          notes_internal,
          notes_service,
          performed_by,
          prepayments_eur,
          status,
          total_net,
          total_gross,
          created_at,
          updated_at,
          client:clients(id, name, phone, email),
          car:cars(id, model, year, vin, license_plate, mileage),
          items:offer_items(id, offer_id, type, description, brand, part_number, unit_price, quantity, total, sort_order),
          service_actions(id, offer_id, action_name, time_required_text, price_per_hour_eur_net, total_eur_net, is_fixed_price, fixed_price_amount, sort_order)
        `
        )
        .eq("id", id)
        .order("sort_order", {
          referencedTable: "offer_items",
          ascending: true,
        })
        .order("sort_order", {
          referencedTable: "service_actions",
          ascending: true,
        })
        .single();

      if (error) throw error;

      return data as OfferWithRelations;
    },
    enabled: !!id,
    staleTime: 60 * 1000, // Consider data fresh for 60 seconds (increased from 30s)
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (increased from 5min)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// Generate new offer number
async function generateOfferNumber(): Promise<string> {
  const { data, error } = await supabase.rpc("generate_offer_number");

  if (error) {
    // Fallback to client-side generation
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 99999)
      .toString()
      .padStart(5, "0");
    return `${year}-${random}`;
  }

  return data;
}

// Create offer mutation
export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      offer: Omit<InsertOffer, "offer_number">;
      items: Omit<InsertOfferItem, "offer_id">[];
    }) => {
      // Generate offer number
      const offerNumber = await generateOfferNumber();

      // Insert offer
      const offerPayload: InsertOffer = {
        ...data.offer,
        offer_number: offerNumber,
      };

      const offerRes = await supabase
        .from("offers")
        .insert(offerPayload as never)
        .select()
        .single();

      const offer = offerRes.data as Offer | null;
      if (offerRes.error) throw offerRes.error;
      if (!offer) throw new Error("Failed to create offer");

      // Insert items if any
      if (data.items.length > 0) {
        const itemsWithOfferId: InsertOfferItem[] = data.items.map(
          (item, index) => ({
            ...item,
            offer_id: offer.id,
            sort_order: index,
          })
        );

        const { error: itemsError } = await supabase
          .from("offer_items")
          .insert(itemsWithOfferId as never);

        if (itemsError) throw itemsError;
      }

      return offer as Offer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}

// Update offer mutation
export function useUpdateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      offer: UpdateOffer;
      items?: Omit<InsertOfferItem, "offer_id">[];
    }) => {
      // Update offer
      const offerRes = await supabase
        .from("offers")
        .update(data.offer as never)
        .eq("id", data.id)
        .select()
        .single();

      const offer = offerRes.data as Offer | null;
      if (offerRes.error) throw offerRes.error;
      if (!offer) throw new Error("Failed to update offer");

      // Update items if provided
      if (data.items) {
        // Delete existing items
        await supabase.from("offer_items").delete().eq("offer_id", data.id);

        // Insert new items
        if (data.items.length > 0) {
          const itemsWithOfferId: InsertOfferItem[] = data.items.map(
            (item, index) => ({
              ...item,
              offer_id: data.id,
              sort_order: index,
            })
          );

          const { error: itemsError } = await supabase
            .from("offer_items")
            .insert(itemsWithOfferId as never);

          if (itemsError) throw itemsError;
        }
      }

      return offer as Offer;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      queryClient.invalidateQueries({ queryKey: ["offer", variables.id] });
    },
  });
}

// Update offer status
export function useUpdateOfferStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OfferStatus }) => {
      const res = await supabase
        .from("offers")
        .update({ status } as never)
        .eq("id", id)
        .select()
        .single();

      if (res.error) throw res.error;
      return res.data as Offer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}

// Delete offer mutation
export function useDeleteOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("offers").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}

// Clone offer mutation - duplicates offer with same data, appears in list
export function useCloneOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sourceId: string) => {
      const { data: source, error: fetchError } = await supabase
        .from("offers")
        .select(
          `
          offer_number, client_id, car_id, customer_name, customer_phone,
          customer_email, car_model_text, car_model_detail, repair_name,
          car_year, vin_text, license_plate, mileage, created_by_name,
          discount_percent, discount_parts_percent, discount_services_percent,
          notes, notes_internal, notes_service, status, total_net, total_vat,
          total_gross, currency
        `
        )
        .eq("id", sourceId)
        .single();

      if (fetchError || !source)
        throw fetchError || new Error("Offer not found");

      const offerNumber = await generateOfferNumber();
      const sourceObj = source as Record<string, unknown>;

      const { data: newOffer, error: insertError } = await supabase
        .from("offers")
        .insert({
          ...sourceObj,
          offer_number: offerNumber,
          status: "draft",
        } as never)
        .select()
        .single();

      if (insertError || !newOffer) throw insertError;

      const { data: items } = await supabase
        .from("offer_items")
        .select("type, description, brand, part_number, unit_price, quantity")
        .eq("offer_id", sourceId)
        .order("sort_order");

      if (items?.length) {
        const newOfferId = (newOffer as Offer).id;
        await supabase.from("offer_items").insert(
          items.map((item: Record<string, unknown>, i: number) => ({
            ...item,
            offer_id: newOfferId,
            sort_order: i,
          })) as never
        );
      }

      const { data: actions } = await supabase
        .from("service_actions")
        .select(
          "action_name, time_required_text, price_per_hour_eur_net, total_eur_net, is_fixed_price, fixed_price_amount"
        )
        .eq("offer_id", sourceId)
        .order("sort_order");

      if (actions?.length) {
        const newOfferId = (newOffer as Offer).id;
        await supabase.from("service_actions").insert(
          (actions as Record<string, unknown>[]).map((a, i) => ({
            ...a,
            offer_id: newOfferId,
            sort_order: i,
          })) as never
        );
      }

      return newOffer as Offer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
  });
}
