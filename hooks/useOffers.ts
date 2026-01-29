'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { 
  Offer, 
  OfferWithRelations, 
  InsertOffer, 
  UpdateOffer,
  OfferStatus,
  InsertOfferItem,
  OfferItem
} from '@/types/database';

interface OffersFilters {
  status?: OfferStatus | 'all';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

// Fetch offers with filters
export function useOffers(filters: OffersFilters = {}) {
  const { 
    status = 'all', 
    search = '', 
    dateFrom,
    dateTo,
    page = 1, 
    pageSize = 20 
  } = filters;

  return useQuery({
    queryKey: ['offers', { status, search, dateFrom, dateTo, page, pageSize }],
    queryFn: async () => {
      let query = supabase
        .from('offers')
        .select(`
          id,
          offer_number,
          customer_name,
          customer_phone,
          customer_email,
          car_model_text,
          status,
          total_gross,
          created_at,
          client:clients(id, name),
          car:cars(id, model, year)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      // Apply filters
      if (status !== 'all') {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`offer_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`);
      }

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }

      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        offers: data as OfferWithRelations[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    },
    staleTime: 10 * 1000, // Consider data fresh for 10 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false,
  });
}

// Fetch single offer
export function useOffer(id: string | undefined) {
  return useQuery({
    queryKey: ['offer', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          client:clients(id, name, phone, email),
          car:cars(id, model, year, vin, license_plate, mileage),
          items:offer_items(*),
          service_actions(*)
        `)
        .eq('id', id)
        .order('sort_order', { referencedTable: 'offer_items', ascending: true })
        .order('sort_order', { referencedTable: 'service_actions', ascending: true })
        .single();

      if (error) throw error;

      return data as OfferWithRelations;
    },
    enabled: !!id,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });
}

// Generate new offer number
async function generateOfferNumber(): Promise<string> {
  const { data, error } = await supabase.rpc('generate_offer_number');
  
  if (error) {
    // Fallback to client-side generation
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    return `${year}-${random}`;
  }
  
  return data;
}

// Create offer mutation
export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      offer: Omit<InsertOffer, 'offer_number'>;
      items: Omit<InsertOfferItem, 'offer_id'>[];
    }) => {
      // Generate offer number
      const offerNumber = await generateOfferNumber();

      // Insert offer
      const offerPayload: InsertOffer = {
        ...data.offer,
        offer_number: offerNumber,
      };
      
      const offerRes = await supabase
        .from('offers')
        .insert(offerPayload as never)
        .select()
        .single();

      const offer = offerRes.data as Offer | null;
      if (offerRes.error) throw offerRes.error;
      if (!offer) throw new Error('Failed to create offer');

      // Insert items if any
      if (data.items.length > 0) {
        const itemsWithOfferId: InsertOfferItem[] = data.items.map((item, index) => ({
          ...item,
          offer_id: offer.id,
          sort_order: index,
        }));

        const { error: itemsError } = await supabase
          .from('offer_items')
          .insert(itemsWithOfferId as never);

        if (itemsError) throw itemsError;
      }

      return offer as Offer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
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
      items?: Omit<InsertOfferItem, 'offer_id'>[];
    }) => {
      // Update offer
      const offerRes = await supabase
        .from('offers')
        .update(data.offer as never)
        .eq('id', data.id)
        .select()
        .single();

      const offer = offerRes.data as Offer | null;
      if (offerRes.error) throw offerRes.error;
      if (!offer) throw new Error('Failed to update offer');

      // Update items if provided
      if (data.items) {
        // Delete existing items
        await supabase
          .from('offer_items')
          .delete()
          .eq('offer_id', data.id);

        // Insert new items
        if (data.items.length > 0) {
          const itemsWithOfferId: InsertOfferItem[] = data.items.map((item, index) => ({
            ...item,
            offer_id: data.id,
            sort_order: index,
          }));

          const { error: itemsError } = await supabase
            .from('offer_items')
            .insert(itemsWithOfferId as never);

          if (itemsError) throw itemsError;
        }
      }

      return offer as Offer;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['offer', variables.id] });
    },
  });
}

// Update offer status
export function useUpdateOfferStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OfferStatus }) => {
      const res = await supabase
        .from('offers')
        .update({ status } as never)
        .eq('id', id)
        .select()
        .single();

      if (res.error) throw res.error;
      return res.data as Offer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}

// Delete offer mutation
export function useDeleteOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
  });
}



