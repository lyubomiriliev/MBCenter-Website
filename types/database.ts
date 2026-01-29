// Database types for Supabase
// To regenerate: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'admin' | 'mechanic';
export type OfferStatus = 'draft' | 'sent' | 'approved' | 'finished' | 'cancelled';
export type OfferItemType = 'part' | 'labor';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_id: string;
          role: UserRole;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_id: string;
          role?: UserRole;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          auth_id?: string;
          role?: UserRole;
          full_name?: string | null;
          created_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          created_at?: string;
        };
      };
      cars: {
        Row: {
          id: string;
          client_id: string | null;
          model: string;
          year: number | null;
          vin: string | null;
          license_plate: string | null;
          mileage: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id?: string | null;
          model: string;
          year?: number | null;
          vin?: string | null;
          license_plate?: string | null;
          mileage?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string | null;
          model?: string;
          year?: number | null;
          vin?: string | null;
          license_plate?: string | null;
          mileage?: number | null;
          created_at?: string;
        };
      };
      offers: {
        Row: {
          id: string;
          offer_number: string;
          client_id: string | null;
          car_id: string | null;
          customer_name: string | null;
          customer_phone: string | null;
          customer_email: string | null;
          car_model_text: string | null;
          vin_text: string | null;
          license_plate: string | null;
          mileage: number | null;
          car_year: number | null;
          created_by_name: string | null;
          status: OfferStatus;
          total_net: number;
          total_vat: number;
          total_gross: number;
          discount_percent: number;
          currency: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          offer_number: string;
          client_id?: string | null;
          car_id?: string | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          car_model_text?: string | null;
          vin_text?: string | null;
          license_plate?: string | null;
          mileage?: number | null;
          car_year?: number | null;
          created_by_name?: string | null;
          status?: OfferStatus;
          total_net?: number;
          total_vat?: number;
          total_gross?: number;
          discount_percent?: number;
          currency?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          offer_number?: string;
          client_id?: string | null;
          car_id?: string | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          car_model_text?: string | null;
          vin_text?: string | null;
          license_plate?: string | null;
          mileage?: number | null;
          car_year?: number | null;
          created_by_name?: string | null;
          status?: OfferStatus;
          total_net?: number;
          total_vat?: number;
          total_gross?: number;
          discount_percent?: number;
          currency?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      offer_items: {
        Row: {
          id: string;
          offer_id: string;
          type: OfferItemType;
          description: string;
          brand: string | null;
          part_number: string | null;
          unit_price: number;
          quantity: number;
          total: number;
          sort_order: number;
        };
        Insert: {
          id?: string;
          offer_id: string;
          type: OfferItemType;
          description: string;
          brand?: string | null;
          part_number?: string | null;
          unit_price: number;
          quantity?: number;
          total: number;
          sort_order?: number;
        };
        Update: {
          id?: string;
          offer_id?: string;
          type?: OfferItemType;
          description?: string;
          brand?: string | null;
          part_number?: string | null;
          unit_price?: number;
          quantity?: number;
          total?: number;
          sort_order?: number;
        };
      };
      service_actions: {
        Row: {
          id: string;
          offer_id: string;
          action_name: string;
          time_required_text: string | null;
          price_per_hour_eur_net: number;
          total_eur_net: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          offer_id: string;
          action_name: string;
          time_required_text?: string | null;
          price_per_hour_eur_net: number;
          total_eur_net: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          offer_id?: string;
          action_name?: string;
          time_required_text?: string | null;
          price_per_hour_eur_net?: number;
          total_eur_net?: number;
          sort_order?: number;
          created_at?: string;
        };
      };
      offer_payments: {
        Row: {
          id: string;
          offer_id: string;
          amount_eur_net: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          offer_id: string;
          amount_eur_net: number;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          offer_id?: string;
          amount_eur_net?: number;
          note?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_offer_number: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      user_role: UserRole;
      offer_status: OfferStatus;
      offer_item_type: OfferItemType;
    };
  };
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Client = Database['public']['Tables']['clients']['Row'];
export type Car = Database['public']['Tables']['cars']['Row'];
export type Offer = Database['public']['Tables']['offers']['Row'];
export type OfferItem = Database['public']['Tables']['offer_items']['Row'];
export type ServiceAction = Database['public']['Tables']['service_actions']['Row'];
export type OfferPayment = Database['public']['Tables']['offer_payments']['Row'];

export type InsertProfile = Database['public']['Tables']['profiles']['Insert'];
export type InsertClient = Database['public']['Tables']['clients']['Insert'];
export type InsertCar = Database['public']['Tables']['cars']['Insert'];
export type InsertOffer = Database['public']['Tables']['offers']['Insert'];
export type InsertOfferItem = Database['public']['Tables']['offer_items']['Insert'];
export type InsertServiceAction = Database['public']['Tables']['service_actions']['Insert'];
export type InsertOfferPayment = Database['public']['Tables']['offer_payments']['Insert'];

export type UpdateProfile = Database['public']['Tables']['profiles']['Update'];
export type UpdateClient = Database['public']['Tables']['clients']['Update'];
export type UpdateCar = Database['public']['Tables']['cars']['Update'];
export type UpdateOffer = Database['public']['Tables']['offers']['Update'];
export type UpdateOfferItem = Database['public']['Tables']['offer_items']['Update'];
export type UpdateServiceAction = Database['public']['Tables']['service_actions']['Update'];
export type UpdateOfferPayment = Database['public']['Tables']['offer_payments']['Update'];

// Extended types with relations
export interface OfferWithRelations extends Offer {
  client?: Client | null;
  car?: Car | null;
  created_by_profile?: Profile | null;
  items?: OfferItem[];
  service_actions?: ServiceAction[];
  payments?: OfferPayment[];
}

export interface CarWithClient extends Car {
  client?: Client | null;
}

